using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("")]
[ApiController]
public class UrlRedirectController(AppDbContext context) : ControllerBase
{
    private readonly AppDbContext _context = context;

    [HttpGet("{code}")]
    public async Task<IActionResult> RedirectToLongUrl(string code)
    {
        var shortenedUrl = await _context.ShortenedUrls.FirstOrDefaultAsync(u => u.UniqueCode == code);
        if (shortenedUrl == null)
        {
            return NotFound("Shortened URL not found");
        }

        return Redirect(shortenedUrl.LongUrl);
    }
}
