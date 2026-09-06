namespace NexusApi.Models.Dashboard;

public class DashboardStatsResponse
{
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    public int ClientCompanies { get; set; }
    public int TotalDeployments { get; set; }
    public int LiveDeployments { get; set; }
    public int TotalTeamMembers { get; set; }
    public int PendingItems { get; set; }
}