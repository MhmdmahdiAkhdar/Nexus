using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusApi.Models.Deployments;
using NexusApi.Repositories;

namespace NexusApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DeploymentsController : ControllerBase
{
    private readonly IDeploymentRepository _deploymentRepository;

    public DeploymentsController(IDeploymentRepository deploymentRepository)
    {
        _deploymentRepository = deploymentRepository;
    }

    private int? CurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] string? search, [FromQuery] string? stage)
    {
        return Ok(await _deploymentRepository.GetListAsync(search, stage));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDetail(int id)
    {
        var detail = await _deploymentRepository.GetDetailAsync(id);
        if (detail is null) return NotFound(new { message = "Deployment not found." });
        return Ok(detail);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDeploymentRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var newId = await _deploymentRepository.CreateAsync(request, userId.Value);
        return CreatedAtAction(nameof(GetDetail), new { id = newId }, new { id = newId });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDeploymentRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var updated = await _deploymentRepository.UpdateAsync(id, request, userId.Value);
        if (!updated) return NotFound(new { message = "Deployment not found." });

        return Ok(new { message = "Deployment updated." });
    }

    [HttpPost("{id:int}/environments")]
    public async Task<IActionResult> AddEnvironment(int id, [FromBody] CreateEnvironmentRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        await _deploymentRepository.AddEnvironmentAsync(id, request, userId.Value);
        return Ok(new { message = "Environment added." });
    }

    [HttpGet("options/clients")]
    public async Task<IActionResult> GetClientOptions()
    {
        return Ok(await _deploymentRepository.GetClientOptionsAsync());
    }

    [HttpGet("options/products")]
    public async Task<IActionResult> GetProductOptions()
    {
        return Ok(await _deploymentRepository.GetProductOptionsAsync());
    }
}