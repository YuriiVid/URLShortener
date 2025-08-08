namespace API.Services;

public class AboutPageService : IAboutPageService
{
    private readonly string _aboutFilePath = Path.Combine("App_Data", "about.txt");

    public async Task<string> GetContentAsync()
    {
        return await File.ReadAllTextAsync(_aboutFilePath);
    }

    public async Task UpdateContentAsync(string content)
    {
        await File.WriteAllTextAsync(_aboutFilePath, content);
    }
}
