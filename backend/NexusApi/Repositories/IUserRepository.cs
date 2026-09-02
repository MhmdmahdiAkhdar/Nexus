using NexusApi.Models;

namespace NexusApi.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int id);
    Task UpdatePasswordHashAsync(int userId, string newPasswordHash);
}