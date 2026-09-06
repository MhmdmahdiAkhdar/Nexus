using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusApi.Models.Documents;
using NexusApi.Repositories;

namespace NexusApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentRepository _documentRepository;

    public DocumentsController(IDocumentRepository documentRepository)
    {
        _documentRepository = documentRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        return Ok(await _documentRepository.GetAllAsync(search));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGlobalDocumentRequest request)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var userId)) return Unauthorized();

        await _documentRepository.CreateAsync(request, userId);
        return Ok(new { message = "Reference added." });
    }
}