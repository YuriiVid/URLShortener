using API.DTOs;
using API.Extensions;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace API.Controllers;

[ApiController]
[Route("api/about")]
public class AboutPageController : ControllerBase
{
    private readonly AppDbContext _context;

    public AboutPageController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<AboutPageDto>> GetAboutPage()
    {
        var page = await _context.AboutPages.Include(a => a.LastUpdatedBy).FirstOrDefaultAsync(ap => ap.Id == 1);
        if (page == null)
            return NotFound();

        var path = Path.Combine("Storage", page.ContentFileName);
        return new AboutPageDto
        {
            Content = System.IO.File.ReadAllText(path),
            LastUpdatedAt = page.LastUpdated,
            LastUpdatedBy = page.LastUpdatedBy?.UserName ?? "Unknown",
        };
    }

    [HttpPut]
    [Authorize(Policy = "AdminPolicy")]
    public async Task<IActionResult> UpdateAboutPage(UpdateAboutPageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Content is required.");

        var about = await _context.AboutPages.FirstOrDefaultAsync(x => x.Id == 1);
        if (about == null)
            return NotFound();

        var path = Path.Combine("Storage", about.ContentFileName);
        await System.IO.File.WriteAllTextAsync(path, dto.Content);
        about.LastUpdatedById = User.GetCurrentUserId();
        about.LastUpdated = Instant.FromDateTimeUtc(DateTime.UtcNow);

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
