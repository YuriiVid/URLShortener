using API.Seeds;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Models;

public partial class AppDbContext : IdentityDbContext<User, Role, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<ShortenedUrl> ShortenedUrls { get; set; }
    public DbSet<AboutPage> AboutPages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ShortenedUrl>(e => e.HasIndex(p => p.UniqueCode).IsUnique());

        builder.ApplyConfiguration(new RoleConfiguration());
        builder.ApplyConfiguration(new AboutPageConfiguration());
    }
}
