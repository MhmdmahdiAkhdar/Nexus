using Dapper;
using Microsoft.Extensions.Options;

namespace NexusApi.Data.Seed;

public class DatabaseSeeder
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly SeedSettings _settings;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(
        IDbConnectionFactory connectionFactory,
        IOptions<SeedSettings> settings,
        ILogger<DatabaseSeeder> logger)
    {
        _connectionFactory = connectionFactory;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        connection.Open(); // keep this one session open for the whole seed, so LAST_INSERT_ID() stays valid

        await SeedUserAsync(connection, _settings.Admin, isSystemRole: true);
        await SeedUserAsync(connection, _settings.NormalUser, isSystemRole: false);
    }

    private async Task SeedUserAsync(System.Data.IDbConnection connection, SeedUserConfig config, bool isSystemRole)
    {
        if (string.IsNullOrWhiteSpace(config.Email) || string.IsNullOrWhiteSpace(config.Password))
        {
            _logger.LogWarning("Seed config for role '{Role}' is missing email/password — skipping.", config.RoleName);
            return;
        }

        // 1. Ensure the role exists.
        var roleId = await connection.QueryFirstOrDefaultAsync<int?>(
            "SELECT Id FROM Roles WHERE Name = @Name LIMIT 1;",
            new { Name = config.RoleName });

        if (roleId is null)
        {
            // Insert and fetch the new id as two separate calls — combining them into one
            // multi-statement command confuses MySqlConnector's parameter parser.
            await connection.ExecuteAsync(
                @"INSERT INTO Roles (Name, Description, IsSystemRole, CreatedAt)
                  VALUES (@Name, @Description, @IsSystemRole, UTC_TIMESTAMP());",
                new
                {
                    Name = config.RoleName,
                    Description = isSystemRole ? "Full system access" : "Standard user access",
                    IsSystemRole = isSystemRole
                });

            roleId = await connection.QuerySingleAsync<int>("SELECT LAST_INSERT_ID();");

            _logger.LogInformation("Seeded '{Role}' role (Id={RoleId}).", config.RoleName, roleId);
        }

        // 2. Ensure the user exists. Never overwrite an existing password — this only
        // creates the account on first run, it's a no-op on every run after that.
        var existingUser = await connection.QueryFirstOrDefaultAsync<int?>(
            "SELECT Id FROM Users WHERE Email = @Email LIMIT 1;",
            new { config.Email });

        if (existingUser is not null)
        {
            _logger.LogInformation("Seed user '{Email}' already exists — skipping.", config.Email);
            return;
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(config.Password, workFactor: 11);

                await connection.ExecuteAsync(
            @"INSERT INTO Users (Email, PasswordHash, FullName, RoleId, IsActive, MustChangePassword, CreatedAt)
              VALUES (@Email, @PasswordHash, @FullName, @RoleId, TRUE, TRUE, UTC_TIMESTAMP());",
            new
            {
                config.Email,
                PasswordHash = passwordHash,
                FullName = string.IsNullOrWhiteSpace(config.FullName) ? config.Email : config.FullName,
                RoleId = roleId
            });

        _logger.LogInformation("Seeded user: {Email} ({Role})", config.Email, config.RoleName);
    }
}