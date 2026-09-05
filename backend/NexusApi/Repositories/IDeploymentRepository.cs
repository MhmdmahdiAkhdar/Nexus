using NexusApi.Models.Deployments;

namespace NexusApi.Repositories;

public interface IDeploymentRepository
{
    Task<IEnumerable<DeploymentListItemResponse>> GetListAsync(string? search, string? stage);
    Task<DeploymentDetailResponse?> GetDetailAsync(int id);
    Task<int> CreateAsync(CreateDeploymentRequest request, int userId);
    Task<bool> UpdateAsync(int id, UpdateDeploymentRequest request, int userId);
    Task AddEnvironmentAsync(int deploymentId, CreateEnvironmentRequest request, int userId);
    Task<IEnumerable<ClientOptionResponse>> GetClientOptionsAsync();
    Task<IEnumerable<ProductOptionResponse>> GetProductOptionsAsync();
}