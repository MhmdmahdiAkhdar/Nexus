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

    public async Task<IEnumerable<TeamMemberListItemResponse>> GetRegisterAsync(string? search)
    {
        const string sql = @"
            SELECT
                tm.Id, tm.FullName, tm.JobTitle, tm.Department, tm.Status,
                (SELECT GROUP_CONCAT(DISTINCT p.Name SEPARATOR ', ')
                 FROM ProductResponsibilities pr JOIN Products p ON p.Id = pr.ProductId
                 WHERE pr.TeamMemberId = tm.Id) AS ResponsibleProducts,
                (SELECT pr.Responsibility
                 FROM ProductResponsibilities pr
                 WHERE pr.TeamMemberId = tm.Id
                 ORDER BY pr.CreatedAt ASC LIMIT 1) AS ResponsibilityType
            FROM TeamMembers tm
            WHERE (@Search IS NULL OR tm.FullName LIKE CONCAT('%', @Search, '%')
                                  OR tm.Department LIKE CONCAT('%', @Search, '%'))
            ORDER BY tm.CreatedAt ASC;";

        using var connection = _connectionFactory.CreateConnection();
        var rows = await connection.QueryAsync(sql, new { Search = string.IsNullOrWhiteSpace(search) ? null : search });

        return rows.Select(r => new TeamMemberListItemResponse
        {
            Id = (int)r.Id,
            FullName = r.FullName,
            JobTitle = r.JobTitle,
            Department = r.Department,
            Status = r.Status,
            ResponsibleProducts = string.IsNullOrWhiteSpace((string?)r.ResponsibleProducts) ? "—" : r.ResponsibleProducts,
            ResponsibilityType = r.ResponsibilityType
        });
    }

    public async Task<int> CreateAsync(CreateTeamMemberRequest request, int userId)
    {
        const string sql = @"
            INSERT INTO TeamMembers (FullName, JobTitle, Department, Email, Status, CreatedBy, CreatedAt)
            VALUES (@FullName, @JobTitle, @Department, @Email, @Status, @UserId, UTC_TIMESTAMP());";

        using var connection = _connectionFactory.CreateConnection();
        connection.Open();

        await connection.ExecuteAsync(sql, new { request.FullName, request.JobTitle, request.Department, request.Email, request.Status, UserId = userId });
        return await connection.QuerySingleAsync<int>("SELECT LAST_INSERT_ID();");
    }
}