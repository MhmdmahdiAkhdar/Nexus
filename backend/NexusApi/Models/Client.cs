namespace NexusApi.Models;

public class Client
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? Industry { get; set; }
    public string? PrimaryContactName { get; set; }
    public string? PrimaryContactEmail { get; set; }
    public string? SupportPhone { get; set; }
    public string? RegisteredOffice { get; set; }
    public string? AccountOwner { get; set; }
    public string? ContactInfo { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}