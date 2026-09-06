using NexusApi.Models.TeamMembers;

namespace NexusApi.Repositories;

public interface ITeamMemberRepository
{
    Task<IEnumerable<TeamMemberOptionResponse>> GetActiveAsync();
    Task<IEnumerable<TeamMemberListItemResponse>> GetRegisterAsync(string? search);
    Task<int> CreateAsync(CreateTeamMemberRequest request, int userId);
}