using System.ComponentModel.DataAnnotations;

namespace NexusApi.Models.Documents;

public class DocumentListItemResponse
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? DocumentType { get; set; }
    public string? UrlReference { get; set; }
    public string OwnerName { get; set; } = "Unassigned";
    public DateTime? LastUpdatedDate { get; set; }
}

public class CreateGlobalDocumentRequest
{
    [Required] public int ProductId { get; set; }
    [Required] public string Name { get; set; } = string.Empty;
    public string? DocumentType { get; set; }
    public string? UrlReference { get; set; }
}