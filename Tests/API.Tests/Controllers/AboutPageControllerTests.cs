using API.Controllers;
using API.DTOs.AboutPage;
using API.Models;
using API.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Tests.Controllers;

public class AboutPageControllerTests
{
    private DbContextOptions<AppDbContext> CreateInMemoryOptions()
    {
        return new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task GetAboutPage_ReturnsNotFound_WhenPageDoesNotExist()
    {
        using var context = new AppDbContext(CreateInMemoryOptions());
        var controller = new AboutPageController(context);

        var result = await controller.GetAboutPage();

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetAboutPage_ReturnsPage_WhenExists()
    {
        using var context = new AppDbContext(CreateInMemoryOptions());
        var about = new AboutPage
        {
            Id = 1,
            ContentFileName = "about.txt",
            LastUpdatedBy = new User { UserName = "Admin" },
        };
        context.AboutPages.Add(about);
        await context.SaveChangesAsync();

        var filePath = Path.Combine("Storage", about.ContentFileName);
        Directory.CreateDirectory("Storage");
        File.WriteAllText(filePath, "Test content");

        var controller = new AboutPageController(context);

        var result = await controller.GetAboutPage();

        var ok = Assert.IsType<ActionResult<AboutPageDto>>(result);
        var dto = ok.Value;
        Assert.Equal("Test content", dto?.Content);
        Assert.Equal("Admin", dto?.LastUpdatedBy);
    }

    [Fact]
    public async Task UpdateAboutPage_ReturnsBadRequest_WhenContentEmpty()
    {
        using var context = new AppDbContext(CreateInMemoryOptions());
        var controller = new AboutPageController(context);

        var result = await controller.UpdateAboutPage(new UpdateAboutPageDto { Content = "" });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Content is required", badRequest.Value);
    }

    [Fact]
    public async Task UpdateAboutPage_ReturnsNotFound_WhenNoPageExists()
    {
        using var context = new AppDbContext(CreateInMemoryOptions());
        var controller = new AboutPageController(context);

        var result = await controller.UpdateAboutPage(
            new UpdateAboutPageDto { Content = "New text" }
        );

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task UpdateAboutPage_UpdatesContent_WhenValid()
    {
        using var context = new AppDbContext(CreateInMemoryOptions());
        var about = new AboutPage
        {
            Id = 1,
            ContentFileName = "about.txt",
            LastUpdatedBy = new User { UserName = "Old" },
        };
        context.AboutPages.Add(about);
        await context.SaveChangesAsync();

        var filePath = Path.Combine("Storage", about.ContentFileName);
        Directory.CreateDirectory("Storage");
        File.WriteAllText(filePath, "Old content");

        var controller = new AboutPageController(context);

        var httpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(1) };

        controller.ControllerContext.HttpContext = httpContext;

        var result = await controller.UpdateAboutPage(
            new UpdateAboutPageDto { Content = "Updated content" }
        );

        Assert.IsType<NoContentResult>(result);
        Assert.Equal("Updated content", File.ReadAllText(filePath));
    }
}
