using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace API.Models;

public class AboutPage
{
    public int Id { get; set; } = 1;

    [Required]
    public string ContentFileName { get; set; } = string.Empty;
    public Instant? LastUpdated { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public int? LastUpdatedById { get; set; }
    public User LastUpdatedBy { get; set; } = null!;
}
