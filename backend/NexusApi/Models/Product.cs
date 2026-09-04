namespace NexusApi.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BusinessPurpose { get; set; }
    public string LifecycleStatus { get; set; } = string.Empty;
    public string? CurrentVersion { get; set; }
    public string? SupportedMarkets { get; set; }
    public string? Criticality { get; set; }
    public string? Technologies { get; set; }
    public string? OwningTeam { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}