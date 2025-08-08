using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateShortenedUrlDto
{
    [Required]
    public string LongUrl { get; set; } = null!;
}
