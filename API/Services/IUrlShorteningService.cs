namespace API.Services;

public interface IUrlShorteningService
{
    const int DefaultLength = 6;

    Task<string> GenerateUniqueCodeAsync(int length = DefaultLength);
}
