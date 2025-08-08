namespace API.DTOs;

public class ShortenedUrlDto
{
    public int Id { get; set; }
    public string LongUrl { get; set; } = null!;
    public string ShortUrl { get; set; } = null!;
    public int UserId { get; set; }
}
