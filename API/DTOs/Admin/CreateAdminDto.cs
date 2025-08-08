namespace API.DTOs.Admin;

public class CreateAdminDto
{
    public required string UserName { get; set; }
    public required string Password { get; set; }
}
