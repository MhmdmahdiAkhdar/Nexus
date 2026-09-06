using NexusApi.Models.AccessControl;

namespace NexusApi.Repositories;

public interface IAccessControlRepository
{
    Task<IEnumerable<UserListItemResponse>> GetUsersAsync();
    Task<IEnumerable<RoleOptionResponse>> GetRolesAsync();
    Task<(int Id, string TemporaryPassword)> CreateUserAsync(CreateUserRequest request);
    Task<bool> SetActiveAsync(int userId, bool isActive);
}