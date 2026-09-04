using NexusApi.Models.TeamMembers;

namespace NexusApi.Repositories;

public interface ITeamMemberRepository
{
    Task<IEnumerable<TeamMemberOptionResponse>> GetActiveAsync();
}