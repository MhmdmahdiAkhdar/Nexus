using System.ComponentModel.DataAnnotations;

namespace NexusApi.Models.Products;

public class CreateProductRequest
{
    [Required, MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string? BusinessPurpose { get; set; }

    [Required]
    public string LifecycleStatus { get; set; } = string.Empty;

    public string? CurrentVersion { get; set; }
    public string? SupportedMarkets { get; set; }
    public string? Criticality { get; set; }
    public string? Technologies { get; set; }
    public string? OwningTeam { get; set; }
}