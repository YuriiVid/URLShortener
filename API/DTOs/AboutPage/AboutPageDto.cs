using NodaTime;

namespace API.DTOs;

public class AboutPageDto
{
    public string Content { get; set; } = string.Empty;
    public Instant? LastUpdated { get; set; }
    public string LastUpdatedBy { get; set; } = "Unknown";
}
