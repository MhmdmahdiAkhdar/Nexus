using System.ComponentModel.DataAnnotations;

namespace NexusApi.Models.Products;

public class CreateModuleRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required] public string Status { get; set; } = string.Empty;
}

public class AddResponsibilityRequest
{
    [Required] public int TeamMemberId { get; set; }
    [Required] public string Responsibility { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class DeploymentSummaryResponse
{
    public int Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ProductVersion { get; set; }
    public string DeploymentStatus { get; set; } = string.Empty;
    public DateTime? GoLiveDate { get; set; }
    public string? SupportTier { get; set; }
}

public class DocumentResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? DocumentType { get; set; }
    public string? UrlReference { get; set; }
    public DateTime? LastUpdatedDate { get; set; }
}

public class CreateDocumentRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? DocumentType { get; set; }
    public string? UrlReference { get; set; }
}

public class ActivityItemResponse
{
    public int Id { get; set; }
    public string RepositoryName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CommitReference { get; set; }
    public string UpdatedByName { get; set; } = string.Empty;
    public DateTime UpdateDate { get; set; }
}

public class CreateActivityRequest
{
    [Required] public int RepositoryId { get; set; }
    [Required] public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CommitReference { get; set; }
    [Required] public int TeamMemberId { get; set; }
}

public class RepositoryOptionResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}