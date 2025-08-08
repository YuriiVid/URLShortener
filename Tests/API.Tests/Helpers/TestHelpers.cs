using System.Security.Claims;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Tests.Helpers;

public class TestHelpers
{
    public static ClaimsPrincipal CreateUserPrincipal(
        int id,
        bool isAdmin = false,
        bool isSuperAdmin = false
    )
    {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, id.ToString()) };

        if (isAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }
        else if (isSuperAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "SuperAdmin"));
        }

        var identity = new ClaimsIdentity(claims, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    public static DbContextOptions<AppDbContext> CreateNewContextOptions()
    {
        return new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
    }
}
