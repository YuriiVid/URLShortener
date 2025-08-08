using API.Models;
using Microsoft.AspNetCore.Identity;

namespace API.Seeds;

public static class SuperAdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Role>>();

        const string userName = "superadmin";
        const string password = "SuperAdmin123!";
        const string role = "SuperAdmin";

        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new Role { Name = role, NormalizedName = role.ToUpper() });
        }

        var superAdmin = await userManager.FindByNameAsync(userName);
        if (superAdmin == null)
        {
            superAdmin = new User { UserName = userName };

            var result = await userManager.CreateAsync(superAdmin, password);
            if (!result.Succeeded)
            {
                throw new Exception(
                    "Failed to create SuperAdmin: " + string.Join(", ", result.Errors.Select(e => e.Description))
                );
            }
        }

        if (!await userManager.IsInRoleAsync(superAdmin, role))
        {
            await userManager.AddToRoleAsync(superAdmin, role);
        }
    }
}
