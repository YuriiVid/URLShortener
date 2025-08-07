using Microsoft.AspNetCore.Identity;
using NodaTime;

namespace API.Models;

public class User : IdentityUser<int>
{
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
}
