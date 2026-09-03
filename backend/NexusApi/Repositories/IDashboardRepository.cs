using NexusApi.Models.Dashboard;

namespace NexusApi.Repositories;

public interface IDashboardRepository
{
    Task<DashboardStatsResponse> GetStatsAsync();
    Task<IEnumerable<RecentProductResponse>> GetRecentProductsAsync(int limit);
    Task<IEnumerable<AttentionItemResponse>> GetAttentionItemsAsync(int limit);
    Task<EnvironmentReadinessResponse> GetEnvironmentReadinessAsync();

}