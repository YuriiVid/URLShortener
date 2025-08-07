using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/ShortenedUrl")]
[ApiController]
public class ShortenedUrlController : ControllerBase
{
    private readonly AppDbContext _context;

    public ShortenedUrlController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ShortenedUrlDto>>> GetShortenedUrls()
    {
        var urls = await _context.ShortenedUrls.ToListAsync();

        return Ok(
            urls.Select(u => new ShortenedUrlDto
                {
                    LongUrl = u.LongUrl,
                    ShortUrl = u.ShortUrl,
                    UserId = u.UserId,
                })
                .ToList()
        );
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FullShortenedUrlDto>> GetShortenedUrl(int id)
    {
        var url = await _context.ShortenedUrls.Include(u => u.User).FirstOrDefaultAsync(u => u.Id == id);

        if (url == null)
        {
            return NotFound("Shortened URL not found");
        }

        return Ok(
            new FullShortenedUrlDto
            {
                ShortUrl = url.ShortUrl,
                FullUrl = url.LongUrl,
                CreatedAt = url.CreatedAt,
                CreatedBy = url.User?.UserName ?? "Unknown",
            }
        );
    }
}
