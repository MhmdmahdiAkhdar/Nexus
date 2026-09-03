namespace NexusApi.Models.Dashboard;

public class AttentionItemResponse
{
    public int DeploymentId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string DeploymentStatus { get; set; } = string.Empty;
    public DateTime? GoLiveDate { get; set; }
}