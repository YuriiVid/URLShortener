using System.ComponentModel.DataAnnotations;

namespace API.DTOs.Auth;

public class RegisterDto
{
    [StringLength(30, MinimumLength = 3, ErrorMessage = "UserName must be at least {2} and maximum {1} characters")]
    public required string UserName { get; set; }

    [StringLength(50, MinimumLength = 6, ErrorMessage = "Password must be at least {2} and maximum {1} characters")]
    public required string Password { get; set; }
}
