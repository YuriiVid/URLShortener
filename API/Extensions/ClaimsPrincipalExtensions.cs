using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetCurrentUserId(this ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    public static bool IsAdmin(this ClaimsPrincipal user)
    {
        return user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
    }
}
