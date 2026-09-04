namespace NexusApi.Models.Products;

public class ProductListItemResponse
{
    public int Id { get; set; }
    public string RecordCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? CurrentVersion { get; set; }
    public int MarketsCount { get; set; }
    public string LifecycleStatus { get; set; } = string.Empty;
    public string? Criticality { get; set; }
    public string AccountableTeam { get; set; } = "Unassigned";
}