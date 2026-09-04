namespace NexusApi.Models.TeamMembers;

public class TeamMemberOptionResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
}