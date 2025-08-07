using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace API.Models;

public class ShortenedUrl
{
    public int Id { get; set; }

    [MaxLength(2048)]
    public string LongUrl { get; set; } = string.Empty;
    public string ShortUrl { get; set; } = string.Empty;

    [MaxLength(10)]
    public string UniqueCode { get; set; } = string.Empty;
    public int UserId { get; set; }
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public User User { get; set; } = null!;
}
