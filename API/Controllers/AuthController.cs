using API.DTOs;
using API.DTOs.Auth;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController(
    IConfiguration config,
    UserManager<User> userManager,
    IJWTService jwtService,
    SignInManager<User> signInManager,
    ILogger<AuthController> logger,
    AppDbContext context
) : ControllerBase
{
    private readonly IConfiguration _config = config;
    private readonly ILogger _logger = logger;
    private readonly UserManager<User> _userManager = userManager;
    private readonly SignInManager<User> _signInManager = signInManager;
    private readonly IJWTService _jwtService = jwtService;
    private readonly AppDbContext _context = context;

    [HttpGet("refresh-user-token")]
    public async Task<IActionResult> RefreshUserToken()
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var incomingToken))
        {
            return Unauthorized("No token found");
        }

        var tokenEntry = await _context.UserTokens.SingleOrDefaultAsync(t =>
            t.LoginProvider == "RefreshToken" && t.Name == "MyAppRefreshToken" && t.Value == incomingToken
        );

        if (tokenEntry == null)
        {
            return Unauthorized("Invalid token");
        }

        var user = await _userManager.FindByIdAsync(tokenEntry.UserId.ToString());
        if (user == null)
        {
            return Unauthorized("No user found");
        }

        if (!_jwtService.IsRefreshTokenValid(incomingToken))
        {
            await _userManager.RemoveAuthenticationTokenAsync(user, "RefreshToken", "MyAppRefreshToken");
            return Unauthorized("Invalid or expired refresh token");
        }
        if (await _userManager.IsLockedOutAsync(user))
        {
            return Unauthorized(
                $"Your account has been locked due to too many failed attempts. You should wait until {user.LockoutEnd} (UTC time) to be able to login"
            );
        }

        AddRefreshTokenCookie(await _jwtService.CreateRefreshTokenAsync(user));
        return Ok(await CreateAuthUserDto(user));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto model)
    {
        if (await CheckUserNameExistsAsync(model.UserName))
        {
            return BadRequest("Account with given username already exists");
        }

        var userToAdd = new User { UserName = model.UserName };

        var result = await _userManager.CreateAsync(userToAdd, model.Password);
        if (!result.Succeeded)
        {
            _logger.LogError(result.Errors.ToString());
            return BadRequest(result.Errors);
        }

        await _userManager.AddToRoleAsync(userToAdd, "User");

        return Ok(new { title = "Account Created", message = "Your account has been created. You can log in now" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto model)
    {
        var user = await _userManager.FindByNameAsync(model.UserName);
        if (user == null)
        {
            return Unauthorized("Invalid username or password");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, true);
        if (result.IsLockedOut)
        {
            return Unauthorized(
                $"Your account has been locked due to too many failed attempts. You should wait until {user.LockoutEnd} (UTC time) to be able to login"
            );
        }
        if (!result.Succeeded)
        {
            return Unauthorized("Invalid username or password");
        }
        var refresh = await _jwtService.CreateRefreshTokenAsync(user);
        AddRefreshTokenCookie(refresh);

        return Ok(await CreateAuthUserDto(user));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var user = await _userManager.FindByIdAsync(User.GetCurrentUserId().ToString());
        if (user == null)
        {
            return Unauthorized("User not found");
        }

        await _userManager.RemoveAuthenticationTokenAsync(user, "RefreshToken", "MyAppRefreshToken");

        Response.Cookies.Delete("refreshToken");
        return Ok(new { title = "Success", message = "Logged out" });
    }

    private async Task<bool> CheckUserNameExistsAsync(string userName)
    {
        return await _userManager.Users.AnyAsync(x => x.NormalizedUserName == userName.ToUpper());
    }

    private async Task<AuthUserDto> CreateAuthUserDto(User user)
    {
        return new AuthUserDto
        {
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName!,
                Role = (await _userManager.GetRolesAsync(user)).FirstOrDefault() ?? "User",
            },
            JWT = await _jwtService.CreateJWT(user),
        };
    }

    private void AddRefreshTokenCookie(string token)
    {
        Response.Cookies.Append(
            "refreshToken",
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(_config.GetValue<int>("JWT:RefreshTokenExpiresInDays")),
            }
        );
    }
}
