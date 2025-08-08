namespace API.DTOs;

public class CreateAdminDto
{
    public required string UserName { get; set; }
    public required string Password { get; set; }
}
