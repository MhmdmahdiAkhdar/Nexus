using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusApi.Repositories;

namespace NexusApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // any logged-in user can view dashboard data
public class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardController(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardRepository.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("recent-products")]
    public async Task<IActionResult> GetRecentProducts([FromQuery] int limit = 5)
    {
        var products = await _dashboardRepository.GetRecentProductsAsync(limit);
        return Ok(products);
    }

    [HttpGet("needs-attention")]
    public async Task<IActionResult> GetAttentionItems([FromQuery] int limit = 5)
    {
        var items = await _dashboardRepository.GetAttentionItemsAsync(limit);
        return Ok(items);
    }

    [HttpGet("environment-readiness")]
    public async Task<IActionResult> GetEnvironmentReadiness()
    {
        var readiness = await _dashboardRepository.GetEnvironmentReadinessAsync();
        return Ok(readiness);
    }
}