namespace NexusApi.Models.Dashboard;

public class RecentProductResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string .Empty;
    public string LifecycleStatus { get; set; } = string.Empty;
    public string? CurrentVersion { get; set; }
    public DateTime UpdatedAt { get; set; }
}