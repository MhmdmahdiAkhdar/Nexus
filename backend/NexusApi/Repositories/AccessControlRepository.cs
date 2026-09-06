using System.Security.Cryptography;
using System.Text;
using Dapper;
using NexusApi.Data;
using NexusApi.Models.AccessControl;

namespace NexusApi.Repositories;

public class AccessControlRepository : IAccessControlRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AccessControlRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    private static string GenerateTemporaryPassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
        var bytes = RandomNumberGenerator.GetBytes(14);
        var sb = new StringBuilder();
        foreach (var b in bytes) sb.Append(chars[b % chars.Length]);
        return sb.ToString();
    }

    public async Task<IEnumerable<UserListItemResponse>> GetUsersAsync()
    {
        const string sql = @"
            SELECT u.Id, u.FullName, u.Email, r.Name AS RoleName, u.IsActive
            FROM Users u
            JOIN Roles r ON r.Id = u.RoleId
            ORDER BY u.CreatedAt ASC;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<UserListItemResponse>(sql);
    }

    public async Task<IEnumerable<RoleOptionResponse>> GetRolesAsync()
    {
        const string sql = @"
            SELECT r.Id, r.Name,
                (SELECT COUNT(*) FROM RolePermissions rp WHERE rp.RoleId = r.Id) AS PermissionsCount
            FROM Roles r
            ORDER BY r.Name;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<RoleOptionResponse>(sql);
    }

    public async Task<(int Id, string TemporaryPassword)> CreateUserAsync(CreateUserRequest request)
    {
        var tempPassword = GenerateTemporaryPassword();
        var hash = BCrypt.Net.BCrypt.HashPassword(tempPassword, workFactor: 11);

        const string sql = @"
            INSERT INTO Users (Email, PasswordHash, FullName, RoleId, IsActive, MustChangePassword, CreatedAt)
            VALUES (@Email, @PasswordHash, @FullName, @RoleId, TRUE, TRUE, UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        connection.Open();

        await connection.ExecuteAsync(sql, new { request.Email, PasswordHash = hash, request.FullName, request.RoleId });
        var newId = await connection.QuerySingleAsync<int>("SELECT LAST_INSERT_ID();");

        return (newId, tempPassword);
    }

    public async Task<bool> SetActiveAsync(int userId, bool isActive)
    {
        const string sql = "UPDATE Users SET IsActive = @IsActive, UpdatedAt = UTC_TIMESTAMP() WHERE Id = @Id;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { IsActive = isActive, Id = userId });
        return rows > 0;
    }
}