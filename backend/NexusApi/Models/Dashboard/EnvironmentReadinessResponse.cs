namespace NexusApi.Models.Dashboard;

public class EnvironmentReadinessResponse
{
    public int TotalEnvironments { get; set; }
    public int ConfiguredEnvironments { get; set; }
    public double PercentageConfigured { get; set; }
}