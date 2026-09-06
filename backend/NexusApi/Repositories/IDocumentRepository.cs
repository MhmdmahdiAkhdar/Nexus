using NexusApi.Models.Documents;

namespace NexusApi.Repositories;

public interface IDocumentRepository
{
    Task<IEnumerable<DocumentListItemResponse>> GetAllAsync(string? search);
    Task CreateAsync(CreateGlobalDocumentRequest request, int userId);
}