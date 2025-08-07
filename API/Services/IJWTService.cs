using API.Models;

namespace API.Services;

public interface IJWTService
{
    Task<string> CreateJWT(User user);
    Task<string> CreateRefreshTokenAsync(User user);
    bool IsRefreshTokenValid(string storedToken);
}
