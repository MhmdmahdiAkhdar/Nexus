using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
}