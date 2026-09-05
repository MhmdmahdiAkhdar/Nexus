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

    public async Task<IEnumerable<DeploymentListItemResponse>> GetListAsync(string? search, string? stage)
    {
        const string sql = @"
            SELECT
                d.Id, c.CompanyName AS ClientName, c.Country AS ClientCountry,
                p.Name AS ProductName, d.ProductVersion, d.GoLiveDate,
                (SELECT COUNT(*) FROM DeploymentModules dm WHERE dm.DeploymentId = d.Id) AS ModulesCount,
                (SELECT GROUP_CONCAT(e.EnvironmentType SEPARATOR ',') FROM Environments e WHERE e.DeploymentId = d.Id) AS EnvironmentTypes
            FROM Deployments d
            JOIN Clients c ON c.Id = d.ClientId
            JOIN Products p ON p.Id = d.ProductId
            WHERE (@Search IS NULL OR c.CompanyName LIKE CONCAT('%', @Search, '%')
                                  OR p.Name LIKE CONCAT('%', @Search, '%'))
            ORDER BY d.GoLiveDate DESC;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync(sql, new { Search = string.IsNullOrWhiteSpace(search) ? null : search });

        var results = rows.Select(row =>
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
                CurrentStage = currentStage
            };
        });

        if (!string.IsNullOrWhiteSpace(stage))
        {
            results = results.Where(r => string.Equals(r.CurrentStage, stage, StringComparison.OrdinalIgnoreCase));
        }

        return results;
    }

    public async Task<DeploymentDetailResponse?> GetDetailAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string headSql = @"
            SELECT
                d.Id, d.ProductVersion, d.SupportTier, d.GoLiveDate,
                c.Id AS ClientId, c.CompanyName AS ClientName, c.Country AS ClientCountry, c.AccountOwner,
                p.Id AS ProductId, p.Name AS ProductName
            FROM Deployments d
            JOIN Clients c ON c.Id = d.ClientId
            JOIN Products p ON p.Id = d.ProductId
            WHERE d.Id = @Id;";

        var head = await connection.QueryFirstOrDefaultAsync(headSql, new { Id = id });
        if (head is null) return null;

        var environments = (await connection.QueryAsync<EnvironmentResponse>(
            "SELECT Id, EnvironmentName, EnvironmentType, ServerName, ApplicationUrl, AccessReference FROM Environments WHERE DeploymentId = @Id ORDER BY CreatedAt ASC;",
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
            SupportTier = head.SupportTier,
            GoLiveDate = head.GoLiveDate,
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
            INSERT INTO Deployments (ClientId, ProductId, ProductVersion, GoLiveDate, DeploymentStatus, SupportTier, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
            VALUES (@ClientId, @ProductId, @ProductVersion, @GoLiveDate, @DeploymentStatus, @SupportTier, @UserId, @UserId, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

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
            UserId = userId
        });

        return await connection.QuerySingleAsync<int>("SELECT LAST_INSERT_ID();");
    }

    public async Task<bool> UpdateAsync(int id, UpdateDeploymentRequest request, int userId)
    {
        const string sql = @"
            UPDATE Deployments
            SET ProductVersion = @ProductVersion, DeploymentStatus = @DeploymentStatus,
                GoLiveDate = @GoLiveDate, SupportTier = @SupportTier,
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
            UserId = userId
        });

        return rows > 0;
    }

    public async Task AddEnvironmentAsync(int deploymentId, CreateEnvironmentRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO Environments (DeploymentId, EnvironmentName, EnvironmentType, ServerName, ApplicationUrl, AccessReference, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
            VALUES (@DeploymentId, @EnvironmentName, @EnvironmentType, @ServerName, @ApplicationUrl, @AccessReference, @UserId, @UserId, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new
        {
            DeploymentId = deploymentId,
            request.EnvironmentName,
            request.EnvironmentType,
            request.ServerName,
            request.ApplicationUrl,
            request.AccessReference,
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