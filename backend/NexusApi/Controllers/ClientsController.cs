using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusApi.Models.Clients;
using NexusApi.Repositories;

namespace NexusApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientRepository _clientRepository;

    public ClientsController(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    private int? CurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] string? search, [FromQuery] string? status)
    {
        return Ok(await _clientRepository.GetListAsync(search, status));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDetail(int id)
    {
        var detail = await _clientRepository.GetDetailAsync(id);
        if (detail is null) return NotFound(new { message = "Client not found." });
        return Ok(detail);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var client = await _clientRepository.CreateAsync(request, userId.Value);
        return CreatedAtAction(nameof(GetDetail), new { id = client.Id }, client);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClientRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var updated = await _clientRepository.UpdateAsync(id, request, userId.Value);
        if (!updated) return NotFound(new { message = "Client not found." });

        return Ok(new { message = "Client updated." });
    }

    [HttpPost("{id:int}/deployments")]
    public async Task<IActionResult> AddDeployment(int id, [FromBody] CreateClientDeploymentRequest request)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        await _clientRepository.AddDeploymentAsync(id, request, userId.Value);
        return Ok(new { message = "Deployment added." });
    }
}