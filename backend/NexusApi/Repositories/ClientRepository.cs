using Dapper;
using NexusApi.Data;
using NexusApi.Models;
using NexusApi.Models.Clients;

namespace NexusApi.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ClientRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private static string CountryCode(string? country)
    {
        if (string.IsNullOrWhiteSpace(country)) return "XX";
        var letters = new string(country.Where(char.IsLetter).ToArray());
        return letters.Length >= 2 ? letters.Substring(0, 2).ToUpper() : letters.ToUpper().PadRight(2, 'X');
    }

    private static string EnvAbbrev(string? environmentType)
    {
        if (string.IsNullOrWhiteSpace(environmentType)) return "DEP";
        var upper = environmentType.ToUpper();
        return upper.Length <= 4 ? upper : upper.Substring(0, 4);
    }

    public async Task<IEnumerable<ClientListItemResponse>> GetListAsync(string? search, string? status)
    {
        const string sql = @"
            SELECT
                c.Id, c.CompanyName, c.Country, c.PrimaryContactName, c.Status,
                (SELECT COUNT(*) FROM Deployments d WHERE d.ClientId = c.Id AND d.DeploymentStatus = 'Live') AS LiveCount,
                (SELECT COUNT(*) FROM Deployments d WHERE d.ClientId = c.Id AND d.DeploymentStatus IN ('Pilot', 'In Progress')) AS OnboardingCount
            FROM Clients c
            WHERE (@Search IS NULL OR c.CompanyName LIKE CONCAT('%', @Search, '%')
                                  OR c.Country LIKE CONCAT('%', @Search, '%')
                                  OR c.PrimaryContactName LIKE CONCAT('%', @Search, '%'))
              AND (@Status IS NULL OR c.Status = @Status)
            ORDER BY c.UpdatedAt DESC;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync(sql, new
        {
            Search = string.IsNullOrWhiteSpace(search) ? null : search,
            Status = string.IsNullOrWhiteSpace(status) ? null : status
        });

        return rows.Select(row =>
        {
            int id = (int)row.Id;
            int live = (int)row.LiveCount;
            int onboarding = (int)row.OnboardingCount;

            string label = live > 0 ? $"{live} active" : onboarding > 0 ? $"{onboarding} onboarding" : "0 deployments";

            return new ClientListItemResponse
            {
                Id = id,
                RecordCode = $"CLI-{CountryCode(row.Country)}-{id:D3}",
                CompanyName = row.CompanyName,
                Country = row.Country,
                PrimaryContactName = row.PrimaryContactName,
                DeploymentsLabel = label,
                Status = row.Status
            };
        });
    }

    public async Task<ClientDetailResponse?> GetDetailAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        var client = await connection.QueryFirstOrDefaultAsync<Client>("SELECT * FROM Clients WHERE Id = @Id;", new { Id = id });
        if (client is null) return null;

        const string productsSql = @"
            SELECT
                d.Id AS DeploymentId, p.Id AS ProductId, p.Name AS ProductName, d.ProductVersion,
                (SELECT e.EnvironmentType FROM Environments e WHERE e.DeploymentId = d.Id ORDER BY e.CreatedAt ASC LIMIT 1) AS EnvironmentType
            FROM Deployments d
            JOIN Products p ON p.Id = d.ProductId
            WHERE d.ClientId = @ClientId
            ORDER BY d.CreatedAt DESC;";

        var productRows = await connection.QueryAsync(productsSql, new { ClientId = id });

        var connectedProducts = productRows.Select(row =>
        {
            int deploymentId = (int)row.DeploymentId;
            string? envType = row.EnvironmentType;

            return new ConnectedProductResponse
            {
                DeploymentId = deploymentId,
                ProductId = (int)row.ProductId,
                ProductName = row.ProductName,
                ProductVersion = row.ProductVersion,
                EnvironmentType = envType,
                RecordCode = $"{EnvAbbrev(envType)}-{CountryCode(client.Country)}-{deploymentId:D3}"
            };
        }).ToList();

        return new ClientDetailResponse
        {
            Id = client.Id,
            RecordCode = $"CLI-{CountryCode(client.Country)}-{client.Id:D3}",
            CompanyName = client.CompanyName,
            Country = client.Country,
            Industry = client.Industry,
            Status = client.Status,
            PrimaryContactName = client.PrimaryContactName,
            PrimaryContactEmail = client.PrimaryContactEmail,
            SupportPhone = client.SupportPhone,
            RegisteredOffice = client.RegisteredOffice,
            AccountOwner = client.AccountOwner,
            CreatedAt = client.CreatedAt,
            ConnectedProducts = connectedProducts
        };
    }

    public async Task<Client> CreateAsync(CreateClientRequest request, int createdByUserId)
    {
        const string insertSql = @"
            INSERT INTO Clients
                (CompanyName, Country, Industry, PrimaryContactName, PrimaryContactEmail,
                 SupportPhone, RegisteredOffice, AccountOwner, Status, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
            VALUES
                (@CompanyName, @Country, @Industry, @PrimaryContactName, @PrimaryContactEmail,
                 @SupportPhone, @RegisteredOffice, @AccountOwner, @Status, @CreatedByUserId, @CreatedByUserId, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        connection.Open();

        await connection.ExecuteAsync(insertSql, new
        {
            request.CompanyName,
            request.Country,
            request.Industry,
            request.PrimaryContactName,
            request.PrimaryContactEmail,
            request.SupportPhone,
            request.RegisteredOffice,
            request.AccountOwner,
            request.Status,
            CreatedByUserId = createdByUserId
        });

        var newId = await connection.QuerySingleAsync<int>("SELECT LAST_INSERT_ID();");
        return await connection.QuerySingleAsync<Client>("SELECT * FROM Clients WHERE Id = @Id;", new { Id = newId });
    }

    public async Task<bool> UpdateAsync(int id, UpdateClientRequest request, int updatedByUserId)
    {
        const string sql = @"
            UPDATE Clients
            SET CompanyName = @CompanyName, Country = @Country, Industry = @Industry,
                PrimaryContactName = @PrimaryContactName, PrimaryContactEmail = @PrimaryContactEmail,
                SupportPhone = @SupportPhone, RegisteredOffice = @RegisteredOffice, AccountOwner = @AccountOwner,
                Status = @Status, UpdatedBy = @UpdatedByUserId, UpdatedAt = UTC_TIMESTAMP()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            request.CompanyName,
            request.Country,
            request.Industry,
            request.PrimaryContactName,
            request.PrimaryContactEmail,
            request.SupportPhone,
            request.RegisteredOffice,
            request.AccountOwner,
            request.Status,
            UpdatedByUserId = updatedByUserId
        });

        return rows > 0;
    }

    public async Task AddDeploymentAsync(int clientId, CreateClientDeploymentRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO Deployments
                (ClientId, ProductId, ProductVersion, GoLiveDate, DeploymentStatus, SupportTier, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
            VALUES
                (@ClientId, @ProductId, @ProductVersion, @GoLiveDate, @DeploymentStatus, @SupportTier, @UserId, @UserId, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new
        {
            ClientId = clientId,
            request.ProductId,
            request.ProductVersion,
            request.GoLiveDate,
            request.DeploymentStatus,
            request.SupportTier,
            UserId = userId
        });
    }
}