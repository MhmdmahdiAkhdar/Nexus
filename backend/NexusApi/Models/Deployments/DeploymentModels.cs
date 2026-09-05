using System.ComponentModel.DataAnnotations;

namespace NexusApi.Models.Deployments;

public class DeploymentListItemResponse
{
    public int Id { get; set; }
    public string RecordCode { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? ProductVersion { get; set; }
    public int ModulesCount { get; set; }
    public DateTime? GoLiveDate { get; set; }
    public string CurrentStage { get; set; } = string.Empty;
}

public class EnvironmentResponse
{
    public int Id { get; set; }
    public string EnvironmentName { get; set; } = string.Empty;
    public string? EnvironmentType { get; set; }
    public string? ServerName { get; set; }
    public string? ApplicationUrl { get; set; }
    public string? AccessReference { get; set; }
}

public class DeploymentDetailResponse
{
    public int Id { get; set; }
    public string RecordCode { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientCountry { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductVersion { get; set; }
    public string CurrentStage { get; set; } = string.Empty;
    public string? SupportTier { get; set; }
    public DateTime? GoLiveDate { get; set; }
    public int EnabledModulesCount { get; set; }
    public int TotalModulesCount { get; set; }
    public string? AccountOwner { get; set; }
    public string? MainBranch { get; set; }
    public int ConfiguredEnvironmentsCount { get; set; }
    public string? LatestActivityTitle { get; set; }
    public string? LatestActivityCommitRef { get; set; }
    public List<EnvironmentResponse> Environments { get; set; } = new();
}

public class CreateDeploymentRequest
{
    [Required] public int ClientId { get; set; }
    [Required] public int ProductId { get; set; }
    public string? ProductVersion { get; set; }
    [Required] public string DeploymentStatus { get; set; } = string.Empty;
    public DateTime? GoLiveDate { get; set; }
    public string? SupportTier { get; set; }
}

public class UpdateDeploymentRequest
{
    public string? ProductVersion { get; set; }
    [Required] public string DeploymentStatus { get; set; } = string.Empty;
    public DateTime? GoLiveDate { get; set; }
    public string? SupportTier { get; set; }
}

public class CreateEnvironmentRequest
{
    [Required] public string EnvironmentName { get; set; } = string.Empty;
    [Required] public string EnvironmentType { get; set; } = string.Empty;
    public string? ServerName { get; set; }
    public string? ApplicationUrl { get; set; }
    public string? AccessReference { get; set; }
}

public class ClientOptionResponse
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
}

public class ProductOptionResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}