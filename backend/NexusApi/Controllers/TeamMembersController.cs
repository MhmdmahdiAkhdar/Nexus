using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusApi.Models.TeamMembers;
using NexusApi.Repositories;

namespace NexusApi.Controllers;

[ApiController]
[Route("api/team-members")]
[Authorize]
public class TeamMembersController : ControllerBase
{
    private readonly ITeamMemberRepository _teamMemberRepository;

    public TeamMembersController(ITeamMemberRepository teamMemberRepository)
    {
        _teamMemberRepository = teamMemberRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetActive()
    {
        return Ok(await _teamMemberRepository.GetActiveAsync());
    }

    [HttpGet("register")]
    public async Task<IActionResult> GetRegister([FromQuery] string? search)
    {
        return Ok(await _teamMemberRepository.GetRegisterAsync(search));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamMemberRequest request)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var userId)) return Unauthorized();

        var id = await _teamMemberRepository.CreateAsync(request, userId);
        return Ok(new { id });
    }
}