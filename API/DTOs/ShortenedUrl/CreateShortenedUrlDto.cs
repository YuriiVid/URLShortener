using System.ComponentModel.DataAnnotations;

namespace API.DTOs.ShortenedUrl;

public class CreateShortenedUrlDto
{
    [Required]
    public string LongUrl { get; set; } = null!;
}
