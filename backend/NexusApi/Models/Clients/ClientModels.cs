using System.ComponentModel.DataAnnotations;

namespace NexusApi.Models.Clients;

public class ClientListItemResponse
{
    public int Id { get; set; }
    public string RecordCode { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? PrimaryContactName { get; set; }
    public string DeploymentsLabel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class ConnectedProductResponse
{
    public int DeploymentId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductVersion { get; set; }
    public string? EnvironmentType { get; set; }
    public string RecordCode { get; set; } = string.Empty;
}

public class ClientDetailResponse
{
    public int Id { get; set; }
    public string RecordCode { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? Industry { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? PrimaryContactName { get; set; }
    public string? PrimaryContactEmail { get; set; }
    public string? SupportPhone { get; set; }
    public string? RegisteredOffice { get; set; }
    public string? AccountOwner { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ConnectedProductResponse> ConnectedProducts { get; set; } = new();
}

public class CreateClientRequest
{
    [Required, MaxLength(255)]
    public string CompanyName { get; set; } = string.Empty;

    public string? Country { get; set; }
    public string? Industry { get; set; }

    [Required]
    public string Status { get; set; } = string.Empty;

    public string? PrimaryContactName { get; set; }
    public string? PrimaryContactEmail { get; set; }
    public string? SupportPhone { get; set; }
    public string? RegisteredOffice { get; set; }
    public string? AccountOwner { get; set; }
}

public class UpdateClientRequest : CreateClientRequest
{
}

public class CreateClientDeploymentRequest
{
    [Required] public int ProductId { get; set; }
    public string? ProductVersion { get; set; }
    [Required] public string DeploymentStatus { get; set; } = string.Empty;
    public DateTime? GoLiveDate { get; set; }
    public string? SupportTier { get; set; }
}