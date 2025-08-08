namespace API.DTOs;

public class ShortenedUrlDto
{
    public string LongUrl { get; set; } = null!;
    public string ShortUrl { get; set; } = null!;
    public int UserId { get; set; }
}
