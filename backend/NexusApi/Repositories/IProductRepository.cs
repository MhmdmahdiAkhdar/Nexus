using NexusApi.Models;
using NexusApi.Models.Products;

namespace NexusApi.Repositories;

public interface IProductRepository
{
    Task<IEnumerable<ProductListItemResponse>> GetListAsync(string? search, string? lifecycleStatus);
    Task<Product> CreateAsync(CreateProductRequest request, int createdByUserId);
    Task<ProductDetailResponse?> GetDetailAsync(int id);
    Task<Product?> GetByIdAsync(int id);
    Task<bool> UpdateAsync(int id, UpdateProductRequest request, int updatedByUserId);

    Task CreateModuleAsync(int productId, CreateModuleRequest request, int userId);
    Task AddResponsibilityAsync(int productId, AddResponsibilityRequest request, int userId);
    Task RemoveResponsibilityAsync(int productId, int responsibilityId);

    Task<IEnumerable<DeploymentSummaryResponse>> GetDeploymentsAsync(int productId);

    Task<IEnumerable<DocumentResponse>> GetDocumentsAsync(int productId);
    Task CreateDocumentAsync(int productId, CreateDocumentRequest request, int userId);

    Task<IEnumerable<ActivityItemResponse>> GetActivityAsync(int productId);
    Task CreateActivityAsync(int productId, CreateActivityRequest request);

    Task<IEnumerable<RepositoryOptionResponse>> GetRepositoriesAsync(int productId);
}