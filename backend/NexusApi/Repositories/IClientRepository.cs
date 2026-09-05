using NexusApi.Models;
using NexusApi.Models.Clients;

namespace NexusApi.Repositories;

public interface IClientRepository
{
    Task<IEnumerable<ClientListItemResponse>> GetListAsync(string? search, string? status);
    Task<ClientDetailResponse?> GetDetailAsync(int id);
    Task<Client> CreateAsync(CreateClientRequest request, int createdByUserId);
    Task<bool> UpdateAsync(int id, UpdateClientRequest request, int updatedByUserId);
    Task AddDeploymentAsync(int clientId, CreateClientDeploymentRequest request, int userId);
}