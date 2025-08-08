using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class JWTService : IJWTService
{
    private readonly IConfiguration _config;
    private readonly UserManager<User> _userManager;
    private readonly SymmetricSecurityKey _jwtKey;
    private readonly TimeSpan _accessTokenLifetime;
    private readonly TimeSpan _refreshTokenLifetime;

    private const string RefreshProvider = "RefreshToken";
    private const string RefreshTokenName = "MyAppRefreshToken";

    public JWTService(IConfiguration config, UserManager<User> userManager)
    {
        _config = config;
        _userManager = userManager;

        _jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:Key"]!));

        _accessTokenLifetime = TimeSpan.FromMinutes(_config.GetValue<int>("JWT:AccessTokenExpiresInMinutes"));
        _refreshTokenLifetime = TimeSpan.FromDays(_config.GetValue<int>("JWT:RefreshTokenExpiresInDays"));
    }

    public async Task<string> CreateJWT(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName!),
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var creds = new SigningCredentials(_jwtKey, SecurityAlgorithms.HmacSha512);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.Add(_accessTokenLifetime),
            SigningCredentials = creds,
            Issuer = _config["JWT:Issuer"],
            Audience = _config["JWT:Audience"],
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);
        return handler.WriteToken(token);
    }

    public async Task<string> CreateRefreshTokenAsync(User user)
    {
        await _userManager.RemoveAuthenticationTokenAsync(user, RefreshProvider, RefreshTokenName);

        var randomPart = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var expires = DateTime.UtcNow.Add(_refreshTokenLifetime).ToString("o");

        var tokenValue = $"{expires}|{randomPart}";

        await _userManager.SetAuthenticationTokenAsync(
            user,
            loginProvider: RefreshProvider,
            tokenName: RefreshTokenName,
            tokenValue: tokenValue
        );

        return tokenValue;
    }

    public bool IsRefreshTokenValid(string storedToken)
    {
        if (string.IsNullOrEmpty(storedToken))
        {
            return false;
        }

        var parts = storedToken.Split('|', 2);
        if (parts.Length != 2)
        {
            return false;
        }

        if (!DateTime.TryParse(parts[0], null, System.Globalization.DateTimeStyles.RoundtripKind, out var expiry))
            return false;

        return expiry > DateTime.UtcNow;
    }
}
