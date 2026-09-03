using Dapper;
using NexusApi.Data;
using NexusApi.Models;

namespace NexusApi.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = @"
            SELECT Id, Email, PasswordHash, FullName, RoleId, IsActive, MustChangePassword, CreatedAt, UpdatedAt
            FROM Users
            WHERE Email = @Email
            LIMIT 1;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT Id, Email, PasswordHash, FullName, RoleId, IsActive, MustChangePassword, CreatedAt, UpdatedAt
            FROM Users
            WHERE Id = @Id
            LIMIT 1;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task UpdatePasswordHashAsync(int userId, string newPasswordHash)
    {
        const string sql = @"
            UPDATE Users
            SET PasswordHash = @PasswordHash, MustChangePassword = FALSE, UpdatedAt = UTC_TIMESTAMP()
            WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new { PasswordHash = newPasswordHash, Id = userId });
    }

        public async Task<string?> GetRoleNameByIdAsync(int roleId)
    {
        const string sql = "SELECT Name FROM Roles WHERE Id = @RoleId LIMIT 1;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<string>(sql, new { RoleId = roleId });
    }
}