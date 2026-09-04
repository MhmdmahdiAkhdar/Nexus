namespace NexusApi.Models.Products;

public class ResponsiblePersonResponse
{
    public int ResponsibilityId { get; set; }
    public int TeamMemberId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string Responsibility { get; set; } = string.Empty;
}

public class ModuleResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ProductDetailResponse
{
    public int Id { get; set; }
    public string RecordCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LifecycleStatus { get; set; } = string.Empty;
    public string? Criticality { get; set; }
    public string? Description { get; set; }
    public string? BusinessPurpose { get; set; }
    public string? CurrentVersion { get; set; }
    public string? SupportedMarkets { get; set; }
    public string? Technologies { get; set; }
    public string? OwningTeam { get; set; }
    public int DeployedClientsCount { get; set; }
    public List<ResponsiblePersonResponse> ResponsiblePeople { get; set; } = new();
    public List<ModuleResponse> Modules { get; set; } = new();
}