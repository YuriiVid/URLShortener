using NodaTime;

namespace API.DTOs;

public class FullShortenedUrlDto
{
    public string ShortUrl { get; set; } = null!;
    public string FullUrl { get; set; } = null!;
    public Instant CreatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;
}
