using NodaTime;

namespace API.DTOs.Admin;

public class AdminUserDto
{
    public int Id { get; set; }
    public required string UserName { get; set; }
    public Instant CreatedAt { get; set; }
}
