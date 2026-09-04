using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusApi.Models.Products;
using NexusApi.Repositories;

namespace NexusApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;

    public ProductsController(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    private int? CurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] string? search, [FromQuery] string? lifecycle)
    {
        return Ok(await _productRepository.GetListAsync(search, lifecycle));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDetail(int id)
    {
        var detail = await _productRepository.GetDetailAsync(id);
        if (detail is null) return NotFound(new { message = "Product not found." });
        return Ok(detail);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var product = await _productRepository.CreateAsync(request, userId.Value);
        return CreatedAtAction(nameof(GetDetail), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var updated = await _productRepository.UpdateAsync(id, request, userId.Value);
        if (!updated) return NotFound(new { message = "Product not found." });

        return Ok(new { message = "Product updated." });
    }

    [HttpPost("{id:int}/modules")]
    public async Task<IActionResult> CreateModule(int id, [FromBody] CreateModuleRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        await _productRepository.CreateModuleAsync(id, request, userId.Value);
        return Ok(new { message = "Module added." });
    }

    [HttpPost("{id:int}/responsibilities")]
    public async Task<IActionResult> AddResponsibility(int id, [FromBody] AddResponsibilityRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        await _productRepository.AddResponsibilityAsync(id, request, userId.Value);
        return Ok(new { message = "Responsibility added." });
    }

    [HttpDelete("{id:int}/responsibilities/{responsibilityId:int}")]
    public async Task<IActionResult> RemoveResponsibility(int id, int responsibilityId)
    {
        await _productRepository.RemoveResponsibilityAsync(id, responsibilityId);
        return Ok(new { message = "Responsibility removed." });
    }

    [HttpGet("{id:int}/deployments")]
    public async Task<IActionResult> GetDeployments(int id)
    {
        return Ok(await _productRepository.GetDeploymentsAsync(id));
    }

    [HttpGet("{id:int}/documents")]
    public async Task<IActionResult> GetDocuments(int id)
    {
        return Ok(await _productRepository.GetDocumentsAsync(id));
    }

    [HttpPost("{id:int}/documents")]
    public async Task<IActionResult> CreateDocument(int id, [FromBody] CreateDocumentRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        await _productRepository.CreateDocumentAsync(id, request, userId.Value);
        return Ok(new { message = "Document added." });
    }

    [HttpGet("{id:int}/activity")]
    public async Task<IActionResult> GetActivity(int id)
    {
        return Ok(await _productRepository.GetActivityAsync(id));
    }

    [HttpPost("{id:int}/activity")]
    public async Task<IActionResult> CreateActivity(int id, [FromBody] CreateActivityRequest request)
    {
        await _productRepository.CreateActivityAsync(id, request);
        return Ok(new { message = "Update logged." });
    }

    [HttpGet("{id:int}/repositories")]
    public async Task<IActionResult> GetRepositories(int id)
    {
        return Ok(await _productRepository.GetRepositoriesAsync(id));
    }
}