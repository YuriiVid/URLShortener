using NodaTime;

namespace API.DTOs;

public class AdminUserDto
{
    public int Id { get; set; }
    public required string UserName { get; set; }
    public Instant CreatedAt { get; set; }
}
