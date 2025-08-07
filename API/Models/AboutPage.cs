using System.ComponentModel.DataAnnotations;
using NodaTime;

namespace API.Models;

public class AboutPage
{
    public int Id { get; set; } = 1;

    [Required]
    public string Content { get; set; } = string.Empty;
    public Instant LastUpdated { get; set; }
    public int? LastUpdatedById { get; set; }
    public User LastUpdatedBy { get; set; } = null!;
}
