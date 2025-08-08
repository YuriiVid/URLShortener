using NodaTime;

namespace API.DTOs;

public class FullShortenedUrlDto
{
    public int Id { get; set; }
    public string ShortUrl { get; set; } = null!;
    public string LongUrl { get; set; } = null!;
    public Instant CreatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;
}
