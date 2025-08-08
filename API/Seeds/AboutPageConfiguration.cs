using API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.Seeds
{
    public class AboutPageConfiguration : IEntityTypeConfiguration<AboutPage>
    {
        public void Configure(EntityTypeBuilder<AboutPage> builder)
        {
            builder.HasData(
                new AboutPage
                {
                    Id = 1,
                    ContentFileName = "About_en.txt",
                    LastUpdated = null,
                    LastUpdatedById = null,
                }
            );
        }
    }
}
