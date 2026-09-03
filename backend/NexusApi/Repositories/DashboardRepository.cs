using Dapper;
using NexusApi.Data;
using NexusApi.Models.Dashboard;

namespace NexusApi.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public DashboardRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<DashboardStatsResponse> GetStatsAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        var activeProducts = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Products WHERE LifecycleStatus = 'Active';");

        var clientCompanies = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Clients;");

        var liveDeployments = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Deployments WHERE DeploymentStatus = 'Live';");

        // Assumption: "pending items" = deployments not live yet (Pilot / In Progress).
        var pendingItems = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM Deployments WHERE DeploymentStatus IN ('Pilot', 'In Progress');");

        return new DashboardStatsResponse
        {
            ActiveProducts = activeProducts,
            ClientCompanies = clientCompanies,
            LiveDeployments = liveDeployments,
            PendingItems = pendingItems
        };
    }

    public async Task<IEnumerable<RecentProductResponse>> GetRecentProductsAsync(int limit)
    {
        const string sql = @"
            SELECT Id, Name, LifecycleStatus, CurrentVersion, UpdatedAt
            FROM Products
            ORDER BY UpdatedAt DESC
            LIMIT @Limit;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<RecentProductResponse>(sql, new { Limit = limit });
    }

        public async Task<IEnumerable<AttentionItemResponse>> GetAttentionItemsAsync(int limit)
    {
        const string sql = @"
            SELECT
                d.Id AS DeploymentId,
                c.CompanyName AS ClientName,
                p.Name AS ProductName,
                d.DeploymentStatus,
                d.GoLiveDate
            FROM Deployments d
            JOIN Clients c ON c.Id = d.ClientId
            JOIN Products p ON p.Id = d.ProductId
            WHERE d.DeploymentStatus IN ('Pilot', 'In Progress')
            ORDER BY d.GoLiveDate ASC
            LIMIT @Limit;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<AttentionItemResponse>(sql, new { Limit = limit });
    }

        public async Task<EnvironmentReadinessResponse> GetEnvironmentReadinessAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        var total = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Environments;");

        var configured = await connection.ExecuteScalarAsync<int>(
            @"SELECT COUNT(*) FROM Environments
              WHERE ApplicationUrl IS NOT NULL AND ApplicationUrl <> ''
                AND AccessReference IS NOT NULL AND AccessReference <> '';");

        var percentage = total == 0 ? 0 : Math.Round((double)configured / total * 100, 0);

        return new EnvironmentReadinessResponse
        {
            TotalEnvironments = total,
            ConfiguredEnvironments = configured,
            PercentageConfigured = percentage
        };
    }
}