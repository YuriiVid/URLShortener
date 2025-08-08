using API.Controllers;
using API.DTOs;
using API.Models;
using API.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace API.Tests.Controllers
{
    public class AdminsControllerTests
    {
        [Fact]
        public async Task GetAdmins_ReturnsNotFound_WhenRoleMissing()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();
            roleManager.Setup(r => r.FindByNameAsync("Admin")).ReturnsAsync((Role?)null);

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.GetAdmins();

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Admin role does not exist", notFound.Value);
        }

        [Fact]
        public async Task GetAdmins_ReturnsUsers_WhenRoleExists()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            roleManager
                .Setup(r => r.FindByNameAsync("Admin"))
                .ReturnsAsync(new Role { Name = "Admin" });

            var existingAdmins = new List<User>
            {
                new() { Id = 1, UserName = "admin1" },
                new() { Id = 2, UserName = "admin2" },
            };
            userManager.Setup(u => u.GetUsersInRoleAsync("Admin")).ReturnsAsync(existingAdmins);

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.GetAdmins();

            var ok = Assert.IsType<ActionResult<IEnumerable<AdminUserDto>>>(result);
            var returned = Assert.IsType<OkObjectResult>(ok.Result);
            var list = Assert.IsAssignableFrom<IEnumerable<AdminUserDto>>(returned.Value);
            Assert.Equal(2, list.Count());
            Assert.Contains(list, d => d.UserName == "admin1");
        }

        [Fact]
        public async Task GetAdmin_ReturnsNotFound_WhenMissingOrNotInRole()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            userManager.Setup(u => u.FindByIdAsync("123")).ReturnsAsync((User?)null);

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.GetAdmin(123);
            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Admin not found or does not exist", notFound.Value);

            var user = new User { Id = 5, UserName = "u5" };
            userManager.Setup(u => u.FindByIdAsync("5")).ReturnsAsync(user);
            userManager.Setup(u => u.IsInRoleAsync(user, "Admin")).ReturnsAsync(false);

            var result2 = await controller.GetAdmin(5);
            var notFound2 = Assert.IsType<NotFoundObjectResult>(result2.Result);
            Assert.Equal("Admin not found or does not exist", notFound2.Value);
        }

        [Fact]
        public async Task GetAdmin_ReturnsDto_WhenFoundAndInRole()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            var user = new User { Id = 7, UserName = "jon" };
            userManager.Setup(u => u.FindByIdAsync("7")).ReturnsAsync(user);
            userManager.Setup(u => u.IsInRoleAsync(user, "Admin")).ReturnsAsync(true);

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.GetAdmin(7);

            var dto = Assert.IsType<ActionResult<AdminUserDto>>(result);
            var value = dto.Value!;
            Assert.Equal(7, value.Id);
            Assert.Equal("jon", value.UserName);
        }

        [Fact]
        public async Task CreateAdmin_ReturnsBadRequest_WhenUserNameTaken()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            userManager
                .Setup(u => u.FindByNameAsync("taken"))
                .ReturnsAsync(new User { Id = 2, UserName = "taken" });

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.CreateAdmin(
                new CreateAdminDto { UserName = "taken", Password = "p" }
            );

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Username is already taken", bad.Value);
        }

        [Fact]
        public async Task CreateAdmin_ReturnsBadRequest_WhenCreateFails()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            userManager.Setup(u => u.FindByNameAsync("newuser")).ReturnsAsync((User?)null);
            userManager
                .Setup(u => u.CreateAsync(It.IsAny<User>(), "badpass"))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "weak" }));

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.CreateAdmin(
                new CreateAdminDto { UserName = "newuser", Password = "badpass" }
            );

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(bad.Value);
        }

        [Fact]
        public async Task CreateAdmin_DeletesUserAndReturns500_WhenAddToRoleFails()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            userManager.Setup(u => u.FindByNameAsync("alice")).ReturnsAsync((User?)null);
            userManager
                .Setup(u => u.CreateAsync(It.IsAny<User>(), "pwd"))
                .ReturnsAsync(IdentityResult.Success);
            userManager
                .Setup(u => u.AddToRoleAsync(It.IsAny<User>(), "Admin"))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "noluck" }));
            userManager
                .Setup(u => u.DeleteAsync(It.IsAny<User>()))
                .ReturnsAsync(IdentityResult.Success)
                .Verifiable();

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.CreateAdmin(
                new CreateAdminDto { UserName = "alice", Password = "pwd" }
            );

            var status = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, status.StatusCode);
            userManager.Verify(u => u.DeleteAsync(It.IsAny<User>()), Times.Once);
            logger.Verify(
                l =>
                    l.Log(
                        It.IsAny<LogLevel>(),
                        It.IsAny<EventId>(),
                        It.IsAny<It.IsAnyType>(),
                        It.IsAny<Exception>(),
                        (Func<It.IsAnyType, Exception?, string>)It.IsAny<object>()
                    ),
                Times.AtLeastOnce
            );
        }

        [Fact]
        public async Task CreateAdmin_ReturnsCreated_WhenSuccess()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            userManager.Setup(u => u.FindByNameAsync("bob")).ReturnsAsync((User?)null);
            userManager
                .Setup(u => u.CreateAsync(It.IsAny<User>(), "goodpass"))
                .ReturnsAsync(IdentityResult.Success);
            userManager
                .Setup(u => u.AddToRoleAsync(It.IsAny<User>(), "Admin"))
                .ReturnsAsync(IdentityResult.Success);

            userManager
                .Setup(u => u.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .Callback<User, string>(
                    (u, p) =>
                    {
                        u.Id = 99;
                        u.CreatedAt = NodaTime.Instant.FromDateTimeUtc(DateTime.UtcNow);
                    }
                )
                .ReturnsAsync(IdentityResult.Success);

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.CreateAdmin(
                new CreateAdminDto { UserName = "bob", Password = "goodpass" }
            );

            var created = Assert.IsType<CreatedAtActionResult>(result);
            var dto = Assert.IsType<AdminUserDto>(created.Value);
            Assert.Equal(99, dto.Id);
            Assert.Equal("bob", dto.UserName);
        }

        [Fact]
        public async Task RemoveAdmin_ReturnsNotFound_WhenMissing()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();
            userManager.Setup(u => u.FindByIdAsync("50")).ReturnsAsync((User?)null);

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.RemoveAdmin(50);
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Admin not found", notFound.Value);
        }

        [Fact]
        public async Task RemoveAdmin_ReturnsBadRequest_WhenUserNotInRole()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            var user = new User { Id = 33, UserName = "u33" };
            userManager.Setup(u => u.FindByIdAsync("33")).ReturnsAsync(user);
            userManager.Setup(u => u.IsInRoleAsync(user, "Admin")).ReturnsAsync(false);

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.RemoveAdmin(33);
            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("User is not an admin", bad.Value);
        }

        [Fact]
        public async Task RemoveAdmin_Returns500_WhenDeleteFails()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            var user = new User { Id = 44, UserName = "u44" };
            userManager.Setup(u => u.FindByIdAsync("44")).ReturnsAsync(user);
            userManager.Setup(u => u.IsInRoleAsync(user, "Admin")).ReturnsAsync(true);
            userManager
                .Setup(u => u.DeleteAsync(user))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "fail" }));

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.RemoveAdmin(44);
            var obj = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, obj.StatusCode);
            Assert.Equal("Failed to remove admin role", obj.Value);
        }

        [Fact]
        public async Task RemoveAdmin_ReturnsNoContent_WhenDeleteSucceeds()
        {
            var userManager = IdentityMockHelpers.CreateUserManagerMock<User>();
            var roleManager = IdentityMockHelpers.CreateRoleManagerMock<Role>();

            var user = new User { Id = 55, UserName = "u55" };
            userManager.Setup(u => u.FindByIdAsync("55")).ReturnsAsync(user);
            userManager.Setup(u => u.IsInRoleAsync(user, "Admin")).ReturnsAsync(true);
            userManager.Setup(u => u.DeleteAsync(user)).ReturnsAsync(IdentityResult.Success);

            var logger = new Mock<ILogger<AdminsController>>();
            var controller = new AdminsController(
                userManager.Object,
                roleManager.Object,
                logger.Object
            );

            var result = await controller.RemoveAdmin(55);
            Assert.IsType<NoContentResult>(result);
        }
    }
}
