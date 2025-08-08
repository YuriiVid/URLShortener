using System.Security.Claims;
using System.Text.Json;
using API.Controllers;
using API.DTOs;
using API.Models;
using API.Services;
using API.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MockQueryable.Moq;
using Moq;

namespace API.Tests.Controllers;

public class AuthControllerTests
{
    private IConfiguration CreateConfig()
    {
        var settings = new Dictionary<string, string?> { ["JWT:RefreshTokenExpiresInDays"] = "7" };
        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    private DefaultHttpContext CreateHttpContextWithCookieHeader(
        string cookieName,
        string cookieValue
    )
    {
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers["Cookie"] = $"{cookieName}={cookieValue}";
        return ctx;
    }

    [Fact]
    public async Task RefreshUserToken_NoCookie_ReturnsUnauthorized()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var options = TestHelpers.CreateNewContextOptions();
        await using var db = new AppDbContext(options);

        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext(),
        };

        var res = await controller.RefreshUserToken();

        var unauth = Assert.IsType<UnauthorizedObjectResult>(res);
        Assert.Equal("No token found", unauth.Value);
    }

    [Fact]
    public async Task RefreshUserToken_InvalidTokenEntry_ReturnsUnauthorized()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var options = TestHelpers.CreateNewContextOptions();
        await using var db = new AppDbContext(options);
        await db.SaveChangesAsync();

        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = CreateHttpContextWithCookieHeader("refreshToken", "tok"),
        };

        var res = await controller.RefreshUserToken();

        var unauth = Assert.IsType<UnauthorizedObjectResult>(res);
        Assert.Equal("Invalid token", unauth.Value);
    }

    [Fact]
    public async Task RefreshUserToken_TokenFoundButUserMissing_ReturnsUnauthorized()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var options = TestHelpers.CreateNewContextOptions();
        await using var db = new AppDbContext(options);
        db.UserTokens.Add(
            new IdentityUserToken<int>
            {
                LoginProvider = "RefreshToken",
                Name = "MyAppRefreshToken",
                Value = "incoming",
                UserId = 42,
            }
        );
        await db.SaveChangesAsync();

        userMgr.Setup(u => u.FindByIdAsync("42")).ReturnsAsync((User?)null);

        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = CreateHttpContextWithCookieHeader("refreshToken", "incoming"),
        };

        var res = await controller.RefreshUserToken();

        var unauth = Assert.IsType<UnauthorizedObjectResult>(res);
        Assert.Equal("No user found", unauth.Value);
    }

    [Fact]
    public async Task RefreshUserToken_InvalidRefreshToken_RemovesTokenAndReturnsUnauthorized()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var options = TestHelpers.CreateNewContextOptions();
        await using var db = new AppDbContext(options);
        db.UserTokens.Add(
            new IdentityUserToken<int>
            {
                LoginProvider = "RefreshToken",
                Name = "MyAppRefreshToken",
                Value = "incoming",
                UserId = 99,
            }
        );
        await db.SaveChangesAsync();

        var user = new User { Id = 99, UserName = "u99" };
        userMgr.Setup(u => u.FindByIdAsync("99")).ReturnsAsync(user);

        jwt.Setup(j => j.IsRefreshTokenValid("incoming")).Returns(false);
        userMgr
            .Setup(u => u.RemoveAuthenticationTokenAsync(user, "RefreshToken", "MyAppRefreshToken"))
            .ReturnsAsync(IdentityResult.Success)
            .Verifiable();

        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = CreateHttpContextWithCookieHeader("refreshToken", "incoming"),
        };

        var res = await controller.RefreshUserToken();

        Assert.IsType<UnauthorizedObjectResult>(res);
        userMgr.Verify(
            u => u.RemoveAuthenticationTokenAsync(user, "RefreshToken", "MyAppRefreshToken"),
            Times.Once
        );
    }

    [Fact]
    public async Task RefreshUserToken_ValidRefreshToken_ReturnsOkWithAuthUserDto_AndSetsCookie()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var options = TestHelpers.CreateNewContextOptions();
        await using var db = new AppDbContext(options);
        db.UserTokens.Add(
            new IdentityUserToken<int>
            {
                LoginProvider = "RefreshToken",
                Name = "MyAppRefreshToken",
                Value = "incoming",
                UserId = 5,
            }
        );
        await db.SaveChangesAsync();

        var user = new User { Id = 5, UserName = "user5" };
        userMgr.Setup(u => u.FindByIdAsync("5")).ReturnsAsync(user);

        jwt.Setup(j => j.IsRefreshTokenValid("incoming")).Returns(true);
        jwt.Setup(j => j.CreateRefreshTokenAsync(user)).ReturnsAsync("new-refresh");
        jwt.Setup(j => j.CreateJWT(user)).ReturnsAsync("jwt-token");

        userMgr.Setup(u => u.IsLockedOutAsync(user)).ReturnsAsync(false);
        userMgr.Setup(u => u.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });

        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );
        var ctx = CreateHttpContextWithCookieHeader("refreshToken", "incoming");
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };

        var res = await controller.RefreshUserToken();

        var ok = Assert.IsType<OkObjectResult>(res);
        var authDto = Assert.IsType<AuthUserDto>(ok.Value);
        Assert.Equal("jwt-token", authDto.JWT);
        Assert.Equal("user5", authDto.User.UserName);

        Assert.True(ctx.Response.Headers.ContainsKey("Set-Cookie"));
    }

    [Fact]
    public async Task Register_ReturnsBadRequest_WhenUserNameExists()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var existing = new User
        {
            Id = 1,
            UserName = "exist",
            NormalizedUserName = "EXIST",
        };
        var users = new List<User> { existing };
        var mockDbSet = users.BuildMockDbSet();

        userMgr.Setup(u => u.Users).Returns(mockDbSet.Object);

        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());
        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );

        var res = await controller.Register(
            new RegisterDto { UserName = "exist", Password = "pwd123" }
        );

        var bad = Assert.IsType<BadRequestObjectResult>(res);
        Assert.Equal("Account with given username already exists", bad.Value);
    }

    [Fact]
    public async Task Register_ReturnsBadRequest_WhenCreateFails()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var users = new List<User>();
        var mockDbSet = users.BuildMockDbSet();

        userMgr.Setup(u => u.Users).Returns(mockDbSet.Object);
        userMgr
            .Setup(u => u.CreateAsync(It.IsAny<User>(), "pwd"))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "weak" }));

        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());
        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );

        var res = await controller.Register(new RegisterDto { UserName = "new", Password = "pwd" });
        var bad = Assert.IsType<BadRequestObjectResult>(res);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task Register_ReturnsOk_WhenSuccess()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var users = new List<User>();
        var mockDbSet = users.BuildMockDbSet();

        userMgr.Setup(u => u.Users).Returns(mockDbSet.Object);
        userMgr
            .Setup(u => u.CreateAsync(It.IsAny<User>(), "goodpwd"))
            .ReturnsAsync(IdentityResult.Success);
        userMgr
            .Setup(u => u.AddToRoleAsync(It.IsAny<User>(), "User"))
            .ReturnsAsync(IdentityResult.Success);

        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());
        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );

        var res = await controller.Register(
            new RegisterDto { UserName = "fresh", Password = "goodpwd" }
        );
        var ok = Assert.IsType<OkObjectResult>(res);

        var serialized = JsonSerializer.Serialize(ok.Value);
        Assert.Contains("Account Created", serialized);
    }

    [Fact]
    public async Task Login_UserNotFound_ReturnsUnauthorized()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        userMgr.Setup(u => u.FindByNameAsync("nouser")).ReturnsAsync((User?)null);
        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());

        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );
        var res = await controller.Login(new LoginDto { UserName = "nouser", Password = "x" });

        var unauth = Assert.IsType<UnauthorizedObjectResult>(res);
        Assert.Equal("Invalid username or password", unauth.Value);
    }

    [Fact]
    public async Task Login_LockedOut_ReturnsUnauthorizedWithLockoutInfo()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signInMock = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var user = new User
        {
            Id = 2,
            UserName = "lock",
            LockoutEnd = DateTimeOffset.UtcNow.AddHours(1),
        };
        userMgr.Setup(u => u.FindByNameAsync("lock")).ReturnsAsync(user);
        signInMock
            .Setup(s => s.CheckPasswordSignInAsync(user, "pwd", true))
            .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.LockedOut);

        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());
        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signInMock.Object,
            logger.Object,
            db
        );

        var res = await controller.Login(new LoginDto { UserName = "lock", Password = "pwd" });
        var unauth = Assert.IsType<UnauthorizedObjectResult>(res);
        Assert.Contains("Your account has been locked", unauth.Value!.ToString());
    }

    [Fact]
    public async Task Login_Success_SetsCookieAndReturnsAuthDto()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signInMock = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var user = new User { Id = 3, UserName = "okuser" };
        userMgr.Setup(u => u.FindByNameAsync("okuser")).ReturnsAsync(user);
        signInMock
            .Setup(s => s.CheckPasswordSignInAsync(user, "good", true))
            .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Success);

        jwt.Setup(j => j.CreateRefreshTokenAsync(user)).ReturnsAsync("refresh-new");
        jwt.Setup(j => j.CreateJWT(user)).ReturnsAsync("jwt-abc");

        userMgr.Setup(u => u.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });

        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());

        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signInMock.Object,
            logger.Object,
            db
        );
        var ctx = new DefaultHttpContext();
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };

        var res = await controller.Login(new LoginDto { UserName = "okuser", Password = "good" });

        var ok = Assert.IsType<OkObjectResult>(res);
        var authDto = Assert.IsType<AuthUserDto>(ok.Value);
        Assert.Equal("jwt-abc", authDto.JWT);
        Assert.True(ctx.Response.Headers.ContainsKey("Set-Cookie"));
    }

    [Fact]
    public async Task Login_InvalidPassword_ReturnsUnauthorized()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signInMock = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var user = new User { Id = 10, UserName = "user10" };
        userMgr.Setup(u => u.FindByNameAsync("user10")).ReturnsAsync(user);
        signInMock
            .Setup(s => s.CheckPasswordSignInAsync(user, "bad", true))
            .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Failed);

        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());
        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signInMock.Object,
            logger.Object,
            db
        );

        var res = await controller.Login(new LoginDto { UserName = "user10", Password = "bad" });

        var unauth = Assert.IsType<UnauthorizedObjectResult>(res);
        Assert.Equal("Invalid username or password", unauth.Value);
    }

    [Fact]
    public async Task Logout_UserNotFound_ReturnsUnauthorized()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        userMgr.Setup(u => u.FindByIdAsync("55")).ReturnsAsync((User?)null);

        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());
        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );

        var ctx = new DefaultHttpContext();
        ctx.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "55") })
        );
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };

        var res = await controller.Logout();
        var unauth = Assert.IsType<UnauthorizedObjectResult>(res);
        Assert.Equal("User not found", unauth.Value);
    }

    [Fact]
    public async Task Logout_Success_RemovesTokenAndDeletesCookie_ReturnsOk()
    {
        var config = CreateConfig();
        var userMgr = IdentityMockHelpers.CreateUserManagerMock<User>();
        var signIn = IdentityMockHelpers.CreateSignInManagerMock(userMgr);
        var jwt = new Mock<IJWTService>();
        var logger = new Mock<ILogger<AuthController>>();

        var user = new User { Id = 77, UserName = "toLogout" };
        userMgr.Setup(u => u.FindByIdAsync("77")).ReturnsAsync(user);
        userMgr
            .Setup(u => u.RemoveAuthenticationTokenAsync(user, "RefreshToken", "MyAppRefreshToken"))
            .ReturnsAsync(IdentityResult.Success)
            .Verifiable();

        await using var db = new AppDbContext(TestHelpers.CreateNewContextOptions());
        var controller = new AuthController(
            config,
            userMgr.Object,
            jwt.Object,
            signIn.Object,
            logger.Object,
            db
        );

        var ctx = new DefaultHttpContext();
        ctx.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "77") })
        );
        ctx.Response.Cookies.Append("refreshToken", "some-val");
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };

        var res = await controller.Logout();
        var ok = Assert.IsType<OkObjectResult>(res);
        Assert.NotNull(ok.Value);
        userMgr.Verify(
            u => u.RemoveAuthenticationTokenAsync(user, "RefreshToken", "MyAppRefreshToken"),
            Times.Once
        );
        Assert.True(ctx.Response.Headers.ContainsKey("Set-Cookie"));
    }
}
