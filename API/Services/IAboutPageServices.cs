namespace API.Services;

public interface IAboutPageService
{
    Task<string> GetContentAsync();
    Task UpdateContentAsync(string content);
}
