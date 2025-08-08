namespace API.DTOs.Auth;

public class AuthUserDto
{
    public UserDto User { get; set; } = null!;
    public required string JWT { get; set; }
}
