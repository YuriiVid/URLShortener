using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace API.Tests.Helpers;

public static class IdentityMockHelpers
{
    public static Mock<UserManager<TUser>> CreateUserManagerMock<TUser>(
        IUserStore<TUser>? userStoreParam = null
    )
        where TUser : class
    {
        var userStore = userStoreParam ?? new Mock<IUserStore<TUser>>().Object;
        var userManagerMock = new Mock<UserManager<TUser>>(
            userStore,
            new Mock<IOptions<IdentityOptions>>().Object,
            new Mock<IPasswordHasher<TUser>>().Object,
            Array.Empty<IUserValidator<TUser>>(),
            Array.Empty<IPasswordValidator<TUser>>(),
            new Mock<ILookupNormalizer>().Object,
            new Mock<IdentityErrorDescriber>().Object,
            new Mock<IServiceProvider>().Object,
            new Mock<ILogger<UserManager<TUser>>>().Object
        );
        return userManagerMock;
    }

    public static Mock<RoleManager<TRole>> CreateRoleManagerMock<TRole>()
        where TRole : class
    {
        var roleManagerMock = new Mock<RoleManager<TRole>>(
            new Mock<IRoleStore<TRole>>().Object,
            Array.Empty<IRoleValidator<TRole>>(),
            new Mock<ILookupNormalizer>().Object,
            new Mock<IdentityErrorDescriber>().Object,
            new Mock<ILogger<RoleManager<TRole>>>().Object
        );
        return roleManagerMock;
    }

    public static Mock<SignInManager<TUser>> CreateSignInManagerMock<TUser>(
        Mock<UserManager<TUser>> userManagerMock
    )
        where TUser : class
    {
        var signInManagerMock = new Mock<SignInManager<TUser>>(
            userManagerMock.Object,
            new Mock<IHttpContextAccessor>().Object,
            new Mock<IUserClaimsPrincipalFactory<TUser>>().Object,
            new Mock<IOptions<IdentityOptions>>().Object,
            new Mock<ILogger<SignInManager<TUser>>>().Object,
            new Mock<IAuthenticationSchemeProvider>().Object,
            new Mock<IUserConfirmation<TUser>>().Object
        );
        return signInManagerMock;
    }
}
