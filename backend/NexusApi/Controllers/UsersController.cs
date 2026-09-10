using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using NexusApi.Models.AccessControl;
using NexusApi.Repositories;

namespace NexusApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IAccessControlRepository _accessControlRepository;

    public UsersController(IAccessControlRepository accessControlRepository)
    {
        _accessControlRepository = accessControlRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _accessControlRepository.GetUsersAsync());
    }

    [HttpGet("~/api/roles")]
    public async Task<IActionResult> GetRoles()
    {
        return Ok(await _accessControlRepository.GetRolesAsync());
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var (id, tempPassword) = await _accessControlRepository.CreateUserAsync(request);
            return Ok(new CreateUserResponse { Id = id, Email = request.Email, TemporaryPassword = tempPassword });
        }
        catch (MySqlException ex) when (ex.Number == 1062)
        {
            return BadRequest(new { message = "A user with this email already exists." });
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, [FromBody] SetUserActiveRequest request)
    {
        var updated = await _accessControlRepository.SetActiveAsync(id, request.IsActive);
        if (!updated) return NotFound();
        return Ok(new { message = "Status updated." });
    }
}