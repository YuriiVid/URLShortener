using API.DTOs.ShortenedUrl;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/shortenedUrls")]
[ApiController]
public class ShortenedUrlsController(AppDbContext context, IUrlShorteningService urlShorteningService) : ControllerBase
{
    private readonly AppDbContext _context = context;
    private readonly IUrlShorteningService _urlShorteningService = urlShorteningService;

    [HttpGet]
    public async Task<ActionResult<List<ShortenedUrlDto>>> GetShortenedUrls()
    {
        return Ok(
            (await _context.ShortenedUrls.ToListAsync())
                .Select(u => new ShortenedUrlDto
                {
                    Id = u.Id,
                    LongUrl = u.LongUrl,
                    ShortUrl = u.ShortUrl,
                    UserId = u.UserId,
                })
                .ToList()
        );
    }

    [Authorize]
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
                Id = url.Id,
                ShortUrl = url.ShortUrl,
                LongUrl = url.LongUrl,
                CreatedAt = url.CreatedAt,
                CreatedBy = url.User?.UserName ?? "Unknown",
            }
        );
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ShortenedUrlDto>> CreateShortenedUrl(CreateShortenedUrlDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.LongUrl))
        {
            return BadRequest("Long URL cannot be empty");
        }

        if (!dto.LongUrl.IsValidUrl())
        {
            return BadRequest("Invalid URL format. URL must start with http:// or https://");
        }

        var existingShortenedUrl = await _context.ShortenedUrls.FirstOrDefaultAsync(u => u.LongUrl == dto.LongUrl);
        if (existingShortenedUrl != null)
        {
            return Conflict("Shortened URL already exists for the provided long URL");
        }

        var code = await _urlShorteningService.GenerateUniqueCodeAsync();

        var shortenedUrl = new ShortenedUrl
        {
            LongUrl = dto.LongUrl,
            ShortUrl = $"{Request.BaseUrl()}{code}",
            UserId = User.GetCurrentUserId(),
            UniqueCode = code,
        };

        _context.ShortenedUrls.Add(shortenedUrl);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetShortenedUrl),
            new { id = shortenedUrl.Id },
            new ShortenedUrlDto
            {
                LongUrl = shortenedUrl.LongUrl,
                ShortUrl = shortenedUrl.ShortUrl,
                UserId = shortenedUrl.UserId,
            }
        );
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteShortenedUrl(int id)
    {
        var url = await _context.ShortenedUrls.FindAsync(id);
        if (url == null)
        {
            return NotFound("Shortened URL not found");
        }

        if (url.UserId != User.GetCurrentUserId() && !User.IsAdmin())
        {
            return Forbid();
        }

        _context.ShortenedUrls.Remove(url);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
