using Dapper;
using NexusApi.Data;
using NexusApi.Models.Deployments;

namespace NexusApi.Repositories;

public class DeploymentRepository : IDeploymentRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public DeploymentRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private static string CountryCode(string? country)
    {
        if (string.IsNullOrWhiteSpace(country)) return "XX";
        var letters = new string(country.Where(char.IsLetter).ToArray());
        return letters.Length >= 2 ? letters.Substring(0, 2).ToUpper() : letters.ToUpper().PadRight(2, 'X');
    }

    private static int StageRank(string? environmentType) => environmentType?.Trim().ToLower() switch
    {
        "production" => 4,
        "uat" => 3,
        "staging" => 3,
        "test" => 2,
        "development" => 1,
        _ => 0
    };

    private static string HighestStage(IEnumerable<string?> environmentTypes)
    {
        var types = environmentTypes.Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
        if (types.Count == 0) return "Not deployed";
        return types.OrderByDescending(StageRank).First()!;
    }

    private static string StageAbbrev(string stage) => stage.ToUpper() switch
    {
        "PRODUCTION" => "PROD",
        "DEVELOPMENT" => "DEV",
        "NOT DEPLOYED" => "NEW",
        var s when s.Length <= 4 => s,
        var s => s.Substring(0, 4)
    };

    public async Task<IEnumerable<DeploymentListItemResponse>> GetListAsync(
        string? search, int? productId, int? clientId, string? version, string? environmentType, string? status)
    {
        const string sql = @"
            SELECT
                d.Id, c.CompanyName AS ClientName, c.Country AS ClientCountry,
                p.Name AS ProductName, d.ProductVersion, d.GoLiveDate, d.DeploymentStatus,
                (SELECT COUNT(*) FROM DeploymentModules dm WHERE dm.DeploymentId = d.Id) AS ModulesCount,
                (SELECT GROUP_CONCAT(e.EnvironmentType SEPARATOR ',') FROM Environments e WHERE e.DeploymentId = d.Id) AS EnvironmentTypes
            FROM Deployments d
            JOIN Clients c ON c.Id = d.ClientId
            JOIN Products p ON p.Id = d.ProductId
            WHERE (@Search IS NULL OR c.CompanyName LIKE CONCAT('%', @Search, '%') OR p.Name LIKE CONCAT('%', @Search, '%'))
              AND (@ProductId IS NULL OR d.ProductId = @ProductId)
              AND (@ClientId IS NULL OR d.ClientId = @ClientId)
              AND (@Version IS NULL OR d.ProductVersion LIKE CONCAT('%', @Version, '%'))
              AND (@Status IS NULL OR d.DeploymentStatus = @Status)
              AND (@EnvironmentType IS NULL OR EXISTS (
                    SELECT 1 FROM Environments e2 WHERE e2.DeploymentId = d.Id AND e2.EnvironmentType = @EnvironmentType))
            ORDER BY d.GoLiveDate DESC;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync(sql, new
        {
            Search = string.IsNullOrWhiteSpace(search) ? null : search,
            ProductId = productId,
            ClientId = clientId,
            Version = string.IsNullOrWhiteSpace(version) ? null : version,
            Status = string.IsNullOrWhiteSpace(status) ? null : status,
            EnvironmentType = string.IsNullOrWhiteSpace(environmentType) ? null : environmentType
        });

        return rows.Select(row =>
        {
            int id = (int)row.Id;
            string envTypesRaw = row.EnvironmentTypes ?? "";
            var envTypes = envTypesRaw.Split(',', StringSplitOptions.RemoveEmptyEntries);
            string currentStage = HighestStage(envTypes);

            return new DeploymentListItemResponse
            {
                Id = id,
                RecordCode = $"{StageAbbrev(currentStage)}-{CountryCode(row.ClientCountry)}-{id:D3}",
                ClientName = row.ClientName,
                ProductName = row.ProductName,
                ProductVersion = row.ProductVersion,
                ModulesCount = (int)row.ModulesCount,
                GoLiveDate = row.GoLiveDate,
                CurrentStage = currentStage,
                DeploymentStatus = row.DeploymentStatus
            };
        });
    }

    public async Task<DeploymentDetailResponse?> GetDetailAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string headSql = @"
            SELECT
                d.Id, d.ProductVersion, d.SupportTier, d.GoLiveDate, d.DeploymentStatus, d.ClientSpecificNotes,
                c.Id AS ClientId, c.CompanyName AS ClientName, c.Country AS ClientCountry, c.AccountOwner,
                p.Id AS ProductId, p.Name AS ProductName
            FROM Deployments d
            JOIN Clients c ON c.Id = d.ClientId
            JOIN Products p ON p.Id = d.ProductId
            WHERE d.Id = @Id;";

        var head = await connection.QueryFirstOrDefaultAsync(headSql, new { Id = id });
        if (head is null) return null;

        var environments = (await connection.QueryAsync<EnvironmentResponse>(
            @"SELECT Id, EnvironmentName, EnvironmentType, Purpose, ServerName, OperatingSystem,
                     ApplicationUrl, DatabaseInfo, MonitoringLink, AccessReference, Notes
              FROM Environments WHERE DeploymentId = @Id ORDER BY CreatedAt ASC;",
            new { Id = id })).ToList();

        var currentStage = HighestStage(environments.Select(e => e.EnvironmentType));

        var configuredCount = environments.Count(e =>
            !string.IsNullOrWhiteSpace(e.ApplicationUrl) && !string.IsNullOrWhiteSpace(e.AccessReference));

        int productId = (int)head.ProductId;

        var enabledModulesCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM DeploymentModules WHERE DeploymentId = @Id;", new { Id = id });

        var totalModulesCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Modules WHERE ProductId = @ProductId;", new { ProductId = productId });

        var mainBranch = await connection.QueryFirstOrDefaultAsync<string>(
            "SELECT MainBranch FROM Repositories WHERE ProductId = @ProductId LIMIT 1;", new { ProductId = productId });

        var latestActivity = await connection.QueryFirstOrDefaultAsync(
            @"SELECT ru.Title, ru.CommitReference
              FROM RepositoryUpdates ru
              JOIN Repositories r ON r.Id = ru.RepositoryId
              WHERE r.ProductId = @ProductId
              ORDER BY ru.UpdateDate DESC, ru.CreatedAt DESC
              LIMIT 1;",
            new { ProductId = productId });

        return new DeploymentDetailResponse
        {
            Id = id,
            RecordCode = $"{StageAbbrev(currentStage)}-{CountryCode(head.ClientCountry)}-{id:D3}",
            ClientId = head.ClientId,
            ClientName = head.ClientName,
            ClientCountry = head.ClientCountry,
            ProductId = productId,
            ProductName = head.ProductName,
            ProductVersion = head.ProductVersion,
            CurrentStage = currentStage,
            DeploymentStatus = head.DeploymentStatus,
            SupportTier = head.SupportTier,
            GoLiveDate = head.GoLiveDate,
            ClientSpecificNotes = head.ClientSpecificNotes,
            EnabledModulesCount = enabledModulesCount,
            TotalModulesCount = totalModulesCount,
            AccountOwner = head.AccountOwner,
            MainBranch = mainBranch,
            ConfiguredEnvironmentsCount = configuredCount,
            LatestActivityTitle = latestActivity?.Title,
            LatestActivityCommitRef = latestActivity?.CommitReference,
            Environments = environments
        };
    }

    public async Task<int> CreateAsync(CreateDeploymentRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO Deployments
                (ClientId, ProductId, ProductVersion, GoLiveDate, DeploymentStatus, SupportTier, ClientSpecificNotes, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
            VALUES
                (@ClientId, @ProductId, @ProductVersion, @GoLiveDate, @DeploymentStatus, @SupportTier, @ClientSpecificNotes, @UserId, @UserId, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        connection.Open();

        await connection.ExecuteAsync(sql, new
        {
            request.ClientId,
            request.ProductId,
            request.ProductVersion,
            request.GoLiveDate,
            request.DeploymentStatus,
            request.SupportTier,
            request.ClientSpecificNotes,
            UserId = userId
        });

        return await connection.QuerySingleAsync<int>("SELECT LAST_INSERT_ID();");
    }

    public async Task<bool> UpdateAsync(int id, UpdateDeploymentRequest request, int userId)
    {
        const string sql = @"
            UPDATE Deployments
            SET ProductVersion = @ProductVersion, DeploymentStatus = @DeploymentStatus,
                GoLiveDate = @GoLiveDate, SupportTier = @SupportTier, ClientSpecificNotes = @ClientSpecificNotes,
                UpdatedBy = @UserId, UpdatedAt = UTC_TIMESTAMP()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            request.ProductVersion,
            request.DeploymentStatus,
            request.GoLiveDate,
            request.SupportTier,
            request.ClientSpecificNotes,
            UserId = userId
        });

        return rows > 0;
    }

    public async Task AddEnvironmentAsync(int deploymentId, CreateEnvironmentRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO Environments
                (DeploymentId, EnvironmentName, EnvironmentType, Purpose, ServerName, OperatingSystem,
                 ApplicationUrl, DatabaseInfo, MonitoringLink, AccessReference, Notes, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
            VALUES
                (@DeploymentId, @EnvironmentName, @EnvironmentType, @Purpose, @ServerName, @OperatingSystem,
                 @ApplicationUrl, @DatabaseInfo, @MonitoringLink, @AccessReference, @Notes, @UserId, @UserId, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new
        {
            DeploymentId = deploymentId,
            request.EnvironmentName,
            request.EnvironmentType,
            request.Purpose,
            request.ServerName,
            request.OperatingSystem,
            request.ApplicationUrl,
            request.DatabaseInfo,
            request.MonitoringLink,
            request.AccessReference,
            request.Notes,
            UserId = userId
        });
    }

    public async Task<IEnumerable<ClientOptionResponse>> GetClientOptionsAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ClientOptionResponse>("SELECT Id, CompanyName FROM Clients ORDER BY CompanyName;");
    }

    public async Task<IEnumerable<ProductOptionResponse>> GetProductOptionsAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ProductOptionResponse>("SELECT Id, Name FROM Products ORDER BY Name;");
    }
}