using NodaTime;

namespace API.DTOs.AboutPage;

public class AboutPageDto
{
    public string Content { get; set; } = string.Empty;
    public Instant? LastUpdatedAt { get; set; }
    public string LastUpdatedBy { get; set; } = "Unknown";
}
