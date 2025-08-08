using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Policy = "SuperAdminPolicy")]
[ApiController]
[Route("api/admins")]
public class AdminsController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly ILogger<AdminsController> _logger;

    public AdminsController(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        ILogger<AdminsController> logger
    )
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAdmins()
    {
        var adminRole = await _roleManager.FindByNameAsync("Admin");
        if (adminRole == null)
        {
            return new List<AdminUserDto>();
        }

        var admins = await _userManager.GetUsersInRoleAsync("Admin");

        var adminDtos = admins.Select(admin => new AdminUserDto
        {
            Id = admin.Id,
            UserName = admin.UserName,
            CreatedAt = admin.CreatedAt,
        });

        return Ok(adminDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminUserDto>> GetAdmin(int id)
    {
        var admin = await _userManager.FindByIdAsync(id.ToString());

        if (admin == null || !await _userManager.IsInRoleAsync(admin, "Admin"))
        {
            return NotFound("Admin not found or does not exist");
        }

        return new AdminUserDto
        {
            Id = admin.Id,
            UserName = admin.UserName,
            CreatedAt = admin.CreatedAt,
        };
    }

    [HttpPost]
    public async Task<IActionResult> CreateAdmin(CreateAdminDto dto)
    {
        if (await _userManager.FindByNameAsync(dto.UserName) != null)
        {
            return BadRequest("Username is already taken");
        }

        var newAdmin = new User { UserName = dto.UserName };

        var result = await _userManager.CreateAsync(newAdmin, dto.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        result = await _userManager.AddToRoleAsync(newAdmin, "Admin");
        if (!result.Succeeded)
        {
            _logger.LogError("Failed to add admin role to user {UserName}", dto.UserName);
            await _userManager.DeleteAsync(newAdmin);
            return StatusCode(500, "Failed to create admin account");
        }

        return CreatedAtAction(
            nameof(GetAdmin),
            new { id = newAdmin.Id },
            new AdminUserDto
            {
                Id = newAdmin.Id,
                UserName = newAdmin.UserName,
                CreatedAt = newAdmin.CreatedAt,
            }
        );
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveAdmin(int id)
    {
        var admin = await _userManager.FindByIdAsync(id.ToString());

        if (admin == null)
        {
            return NotFound("Admin not found");
        }

        if (!await _userManager.IsInRoleAsync(admin, "Admin"))
        {
            return BadRequest("User is not an admin");
        }

        var result = await _userManager.RemoveFromRoleAsync(admin, "Admin");
        if (!result.Succeeded)
        {
            return StatusCode(500, "Failed to remove admin role");
        }

        return NoContent();
    }
}
