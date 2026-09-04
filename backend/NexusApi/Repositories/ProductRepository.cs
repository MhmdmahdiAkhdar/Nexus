using Dapper;
using NexusApi.Data;
using NexusApi.Models;
using NexusApi.Models.Products;

namespace NexusApi.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ProductRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private static string RecordCode(int id) => $"PRD-{id:D4}";

    public async Task<IEnumerable<ProductListItemResponse>> GetListAsync(string? search, string? lifecycleStatus)
    {
        const string sql = @"
            SELECT p.Id, p.Name, p.CurrentVersion, p.SupportedMarkets, p.LifecycleStatus, p.Criticality, p.OwningTeam
            FROM Products p
            WHERE (@Search IS NULL OR p.Name LIKE CONCAT('%', @Search, '%'))
              AND (@Lifecycle IS NULL OR p.LifecycleStatus = @Lifecycle)
            ORDER BY p.UpdatedAt DESC;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync(sql, new
        {
            Search = string.IsNullOrWhiteSpace(search) ? null : search,
            Lifecycle = string.IsNullOrWhiteSpace(lifecycleStatus) ? null : lifecycleStatus
        });

        return rows.Select(row =>
        {
            string supportedMarkets = row.SupportedMarkets ?? "";
            int marketsCount = supportedMarkets
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Length;

            int id = (int)row.Id;

            return new ProductListItemResponse
            {
                Id = id,
                RecordCode = RecordCode(id),
                Name = row.Name,
                CurrentVersion = row.CurrentVersion,
                MarketsCount = marketsCount,
                LifecycleStatus = row.LifecycleStatus,
                Criticality = row.Criticality,
                AccountableTeam = row.OwningTeam ?? "Unassigned"
            };
        });
    }

    public async Task<Product> CreateAsync(CreateProductRequest request, int createdByUserId)
    {
        const string insertSql = @"
            INSERT INTO Products
                (Name, Description, BusinessPurpose, LifecycleStatus, CurrentVersion,
                 SupportedMarkets, Criticality, Technologies, OwningTeam, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
            VALUES
                (@Name, @Description, @BusinessPurpose, @LifecycleStatus, @CurrentVersion,
                 @SupportedMarkets, @Criticality, @Technologies, @OwningTeam, @CreatedByUserId, @CreatedByUserId, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        connection.Open();

        await connection.ExecuteAsync(insertSql, new
        {
            request.Name,
            request.Description,
            request.BusinessPurpose,
            request.LifecycleStatus,
            request.CurrentVersion,
            request.SupportedMarkets,
            request.Criticality,
            request.Technologies,
            request.OwningTeam,
            CreatedByUserId = createdByUserId
        });

        var newId = await connection.QuerySingleAsync<int>("SELECT LAST_INSERT_ID();");

        return await connection.QuerySingleAsync<Product>("SELECT * FROM Products WHERE Id = @Id;", new { Id = newId });
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Product>("SELECT * FROM Products WHERE Id = @Id;", new { Id = id });
    }

    public async Task<ProductDetailResponse?> GetDetailAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        var product = await connection.QueryFirstOrDefaultAsync<Product>("SELECT * FROM Products WHERE Id = @Id;", new { Id = id });
        if (product is null) return null;

        var modules = await connection.QueryAsync<ModuleResponse>(
            "SELECT Id, Name, Description, Status FROM Modules WHERE ProductId = @Id ORDER BY CreatedAt ASC;",
            new { Id = id });

        var responsiblePeople = await connection.QueryAsync<ResponsiblePersonResponse>(
            @"SELECT pr.Id AS ResponsibilityId, tm.Id AS TeamMemberId, tm.FullName, tm.JobTitle, pr.Responsibility
              FROM ProductResponsibilities pr
              JOIN TeamMembers tm ON tm.Id = pr.TeamMemberId
              WHERE pr.ProductId = @Id
              ORDER BY pr.CreatedAt ASC;",
            new { Id = id });

        var deployedClientsCount = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(DISTINCT ClientId) FROM Deployments WHERE ProductId = @Id;",
            new { Id = id });

        return new ProductDetailResponse
        {
            Id = product.Id,
            RecordCode = RecordCode(product.Id),
            Name = product.Name,
            LifecycleStatus = product.LifecycleStatus,
            Criticality = product.Criticality,
            Description = product.Description,
            BusinessPurpose = product.BusinessPurpose,
            CurrentVersion = product.CurrentVersion,
            SupportedMarkets = product.SupportedMarkets,
            Technologies = product.Technologies,
            OwningTeam = product.OwningTeam,
            DeployedClientsCount = deployedClientsCount,
            ResponsiblePeople = responsiblePeople.ToList(),
            Modules = modules.ToList()
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateProductRequest request, int updatedByUserId)
    {
        const string sql = @"
            UPDATE Products
            SET Name = @Name, Description = @Description, BusinessPurpose = @BusinessPurpose,
                LifecycleStatus = @LifecycleStatus, CurrentVersion = @CurrentVersion,
                SupportedMarkets = @SupportedMarkets, Criticality = @Criticality,
                Technologies = @Technologies, OwningTeam = @OwningTeam,
                UpdatedBy = @UpdatedByUserId, UpdatedAt = UTC_TIMESTAMP()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            request.Name,
            request.Description,
            request.BusinessPurpose,
            request.LifecycleStatus,
            request.CurrentVersion,
            request.SupportedMarkets,
            request.Criticality,
            request.Technologies,
            request.OwningTeam,
            UpdatedByUserId = updatedByUserId
        });

        return rowsAffected > 0;
    }

    public async Task CreateModuleAsync(int productId, CreateModuleRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO Modules (ProductId, Name, Description, Status, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
            VALUES (@ProductId, @Name, @Description, @Status, @UserId, @UserId, UTC_TIMESTAMP(), UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new { ProductId = productId, request.Name, request.Description, request.Status, UserId = userId });
    }

    public async Task AddResponsibilityAsync(int productId, AddResponsibilityRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO ProductResponsibilities (ProductId, TeamMemberId, Responsibility, Description, CreatedBy, CreatedAt)
            VALUES (@ProductId, @TeamMemberId, @Responsibility, @Description, @UserId, UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new { ProductId = productId, request.TeamMemberId, request.Responsibility, request.Description, UserId = userId });
    }

    public async Task RemoveResponsibilityAsync(int productId, int responsibilityId)
    {
        const string sql = "DELETE FROM ProductResponsibilities WHERE Id = @ResponsibilityId AND ProductId = @ProductId;";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new { ResponsibilityId = responsibilityId, ProductId = productId });
    }

    public async Task<IEnumerable<DeploymentSummaryResponse>> GetDeploymentsAsync(int productId)
    {
        const string sql = @"
            SELECT d.Id, c.CompanyName AS ClientName, d.ProductVersion, d.DeploymentStatus, d.GoLiveDate, d.SupportTier
            FROM Deployments d
            JOIN Clients c ON c.Id = d.ClientId
            WHERE d.ProductId = @ProductId
            ORDER BY d.GoLiveDate DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<DeploymentSummaryResponse>(sql, new { ProductId = productId });
    }

    public async Task<IEnumerable<DocumentResponse>> GetDocumentsAsync(int productId)
    {
        const string sql = @"
            SELECT Id, Name, DocumentType, UrlReference, LastUpdatedDate
            FROM Documents
            WHERE ProductId = @ProductId
            ORDER BY LastUpdatedDate DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<DocumentResponse>(sql, new { ProductId = productId });
    }

    public async Task CreateDocumentAsync(int productId, CreateDocumentRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO Documents (ProductId, Name, DocumentType, UrlReference, LastUpdatedDate, CreatedBy, UpdatedBy, CreatedAt)
            VALUES (@ProductId, @Name, @DocumentType, @UrlReference, CURDATE(), @UserId, @UserId, UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new { ProductId = productId, request.Name, request.DocumentType, request.UrlReference, UserId = userId });
    }

    public async Task<IEnumerable<ActivityItemResponse>> GetActivityAsync(int productId)
    {
        const string sql = @"
            SELECT ru.Id, r.Name AS RepositoryName, ru.Title, ru.Description, ru.CommitReference,
                   tm.FullName AS UpdatedByName, ru.UpdateDate
            FROM RepositoryUpdates ru
            JOIN Repositories r ON r.Id = ru.RepositoryId
            JOIN TeamMembers tm ON tm.Id = ru.UpdatedBy
            WHERE r.ProductId = @ProductId
            ORDER BY ru.UpdateDate DESC, ru.CreatedAt DESC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ActivityItemResponse>(sql, new { ProductId = productId });
    }

    public async Task CreateActivityAsync(int productId, CreateActivityRequest request)
    {
        const string sql = @"
            INSERT INTO RepositoryUpdates (RepositoryId, Title, Description, CommitReference, UpdatedBy, UpdateDate, CreatedAt)
            VALUES (@RepositoryId, @Title, @Description, @CommitReference, @TeamMemberId, CURDATE(), UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new { request.RepositoryId, request.Title, request.Description, request.CommitReference, request.TeamMemberId });
    }

    public async Task<IEnumerable<RepositoryOptionResponse>> GetRepositoriesAsync(int productId)
    {
        const string sql = "SELECT Id, Name FROM Repositories WHERE ProductId = @ProductId ORDER BY Name;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<RepositoryOptionResponse>(sql, new { ProductId = productId });
    }
}