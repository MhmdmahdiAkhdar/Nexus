using Dapper;
using NexusApi.Data;
using NexusApi.Models.TeamMembers;

namespace NexusApi.Repositories;

public class TeamMemberRepository : ITeamMemberRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public TeamMemberRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<TeamMemberOptionResponse>> GetActiveAsync()
    {
        const string sql = "SELECT Id, FullName, JobTitle FROM TeamMembers WHERE Status = 'Active' ORDER BY FullName;";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<TeamMemberOptionResponse>(sql);
    }
}