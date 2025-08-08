using API.Controllers;
using API.DTOs.ShortenedUrl;
using API.Models;
using API.Services;
using API.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace API.Tests.Controllers;

public class ShortenedUrlsControllerTests
{
    [Fact]
    public async Task GetShortenedUrls_ReturnsList()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        ctx.ShortenedUrls.AddRange(
            [
                new ShortenedUrl
                {
                    Id = 1,
                    LongUrl = "https://a",
                    ShortUrl = "s1",
                    UserId = 1,
                },
                new ShortenedUrl
                {
                    Id = 2,
                    LongUrl = "https://b",
                    ShortUrl = "s2",
                    UserId = 2,
                },
            ]
        );
        await ctx.SaveChangesAsync();

        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object);

        var result = await controller.GetShortenedUrls();

        var ok = Assert.IsType<ActionResult<List<ShortenedUrlDto>>>(result);
        var actionResult = Assert.IsType<OkObjectResult>(ok.Result);
        var list = Assert.IsType<List<ShortenedUrlDto>>(actionResult.Value);
        Assert.Equal(2, list.Count);
    }

    [Fact]
    public async Task GetShortenedUrl_ReturnsNotFound_WhenMissing()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(1) },
            },
        };

        var result = await controller.GetShortenedUrl(123);

        var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
        Assert.Equal("Shortened URL not found", notFound.Value);
    }

    [Fact]
    public async Task GetShortenedUrl_ReturnsOk_WhenFound()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        var url = new ShortenedUrl
        {
            Id = 5,
            LongUrl = "https://x",
            ShortUrl = "https://base/abc",
            CreatedAt = NodaTime.Instant.FromDateTimeUtc(DateTime.UtcNow),
            User = new User { UserName = "bob" },
        };
        ctx.ShortenedUrls.Add(url);
        await ctx.SaveChangesAsync();

        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(1) },
            },
        };

        var result = await controller.GetShortenedUrl(5);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<FullShortenedUrlDto>(ok.Value);
        Assert.Equal("bob", dto.CreatedBy);
        Assert.Equal("https://x", dto.LongUrl);
    }

    [Fact]
    public async Task CreateShortenedUrl_BadRequest_WhenLongUrlEmpty()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(1) },
            },
        };

        var result = await controller.CreateShortenedUrl(
            new CreateShortenedUrlDto { LongUrl = " " }
        );

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Long URL cannot be empty", bad.Value);
    }

    [Fact]
    public async Task CreateShortenedUrl_BadRequest_WhenUrlInvalid()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(1) },
            },
        };

        var result = await controller.CreateShortenedUrl(
            new CreateShortenedUrlDto { LongUrl = "not-a-url" }
        );

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Invalid URL format. URL must start with http:// or https://", bad.Value);
    }

    [Fact]
    public async Task CreateShortenedUrl_Conflict_WhenAlreadyExists()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        ctx.ShortenedUrls.Add(
            new ShortenedUrl
            {
                LongUrl = "https://dup",
                ShortUrl = "s",
                UniqueCode = "u",
                UserId = 1,
            }
        );
        await ctx.SaveChangesAsync();

        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(1) },
            },
        };

        var result = await controller.CreateShortenedUrl(
            new CreateShortenedUrlDto { LongUrl = "https://dup" }
        );

        var conflict = Assert.IsType<ConflictObjectResult>(result.Result);
        Assert.Equal("Shortened URL already exists for the provided long URL", conflict.Value);
    }

    [Fact]
    public async Task CreateShortenedUrl_Creates_WhenValid()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);

        var mockService = new Mock<IUrlShorteningService>();
        mockService.Setup(s => s.GenerateUniqueCodeAsync(It.IsAny<int>())).ReturnsAsync("abc123");

        var controller = new ShortenedUrlsController(ctx, mockService.Object);

        var httpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(42) };
        httpContext.Request.Scheme = "https";
        httpContext.Request.Host = new HostString("example.com");
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var dto = new CreateShortenedUrlDto { LongUrl = "https://valid.example" };

        var result = await controller.CreateShortenedUrl(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnDto = Assert.IsType<ShortenedUrlDto>(created.Value);
        Assert.Equal("https://valid.example", returnDto.LongUrl);
        Assert.Equal(42, returnDto.UserId);

        var stored = ctx.ShortenedUrls.FirstOrDefault();
        Assert.NotNull(stored);
        Assert.Equal("abc123", stored.UniqueCode);
        Assert.Equal("https://example.com/abc123", stored.ShortUrl);
    }

    [Fact]
    public async Task DeleteShortenedUrl_ReturnsNotFound_WhenMissing()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);

        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(1) },
            },
        };

        var result = await controller.DeleteShortenedUrl(999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Shortened URL not found", notFound.Value);
    }

    [Fact]
    public async Task DeleteShortenedUrl_ReturnsForbid_WhenNotOwnerOrAdmin()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        ctx.ShortenedUrls.Add(
            new ShortenedUrl
            {
                Id = 10,
                LongUrl = "https://x",
                UserId = 1,
            }
        );
        await ctx.SaveChangesAsync();

        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(2) },
            },
        };

        var result = await controller.DeleteShortenedUrl(10);
        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task DeleteShortenedUrl_Succeeds_WhenOwner()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        ctx.ShortenedUrls.Add(
            new ShortenedUrl
            {
                Id = 11,
                LongUrl = "https://x",
                UserId = 77,
            }
        );
        await ctx.SaveChangesAsync();

        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = TestHelpers.CreateUserPrincipal(77) },
            },
        };

        var result = await controller.DeleteShortenedUrl(11);
        Assert.IsType<NoContentResult>(result);

        Assert.Null(await ctx.ShortenedUrls.FindAsync(11));
    }

    [Fact]
    public async Task DeleteShortenedUrl_Succeeds_WhenAdmin()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);
        ctx.ShortenedUrls.Add(
            new ShortenedUrl
            {
                Id = 12,
                LongUrl = "https://x",
                UserId = 40,
            }
        );
        await ctx.SaveChangesAsync();

        var mockService = new Mock<IUrlShorteningService>();
        var controller = new ShortenedUrlsController(ctx, mockService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = TestHelpers.CreateUserPrincipal(999, isAdmin: true),
                },
            },
        };

        var result = await controller.DeleteShortenedUrl(12);
        Assert.IsType<NoContentResult>(result);
        Assert.Null(await ctx.ShortenedUrls.FindAsync(12));
    }
}

public class UrlShorteningServiceTests
{
    [Fact]
    public async Task GenerateUniqueCodeAsync_Throws_WhenLengthInvalid()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);

        var svc = new UrlShorteningService(ctx);
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => svc.GenerateUniqueCodeAsync(0));
    }

    [Fact]
    public async Task GenerateUniqueCodeAsync_Returns_CodeOfExpectedLength_AndNotInDb()
    {
        var options = TestHelpers.CreateNewContextOptions();
        using var ctx = new AppDbContext(options);

        ctx.ShortenedUrls.AddRange(
            [new ShortenedUrl { UniqueCode = "aaaaaa" }, new ShortenedUrl { UniqueCode = "bbbbbb" }]
        );
        await ctx.SaveChangesAsync();

        var svc = new UrlShorteningService(ctx);
        var code = await svc.GenerateUniqueCodeAsync(6);

        Assert.NotNull(code);
        Assert.Equal(6, code.Length);
        var exists = ctx.ShortenedUrls.Any(s => s.UniqueCode == code);
        Assert.False(exists);
    }
}
