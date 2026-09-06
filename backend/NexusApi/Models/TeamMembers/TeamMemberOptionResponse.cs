using System.ComponentModel.DataAnnotations;

namespace NexusApi.Models.TeamMembers;

public class TeamMemberOptionResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
}

public class TeamMemberListItemResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string ResponsibleProducts { get; set; } = "—";
    public string? ResponsibilityType { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateTeamMemberRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? Email { get; set; }
    [Required] public string Status { get; set; } = "Active";
}