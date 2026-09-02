using System.Data;
using MySqlConnector;

namespace NexusApi.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

public class MySqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public MySqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' is missing from appsettings.json.");
    }

    public IDbConnection CreateConnection() => new MySqlConnection(_connectionString);
}