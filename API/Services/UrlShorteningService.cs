using System.Security.Cryptography;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class UrlShorteningService : IUrlShorteningService
{
    private const string ValidChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private const int MaxRetries = 3;
    private readonly AppDbContext _dbContext;
    private readonly RandomNumberGenerator _rng;

    public UrlShorteningService(AppDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _rng = RandomNumberGenerator.Create();
    }

    public async Task<string> GenerateUniqueCodeAsync(int length)
    {
        if (length <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(length), "Length must be greater than 0");
        }

        int retryCount = 0;
        while (retryCount < MaxRetries)
        {
            const int batchSize = 10;
            var candidates = new HashSet<string>();

            for (int i = 0; i < batchSize; i++)
            {
                candidates.Add(GenerateUniqueCode(length));
            }

            var existingCodes = await _dbContext
                .ShortenedUrls.Where(s => candidates.Contains(s.UniqueCode))
                .Select(s => s.UniqueCode)
                .ToListAsync();

            var availableCode = candidates.Except(existingCodes).FirstOrDefault();
            if (availableCode != null)
            {
                return availableCode;
            }

            retryCount++;
        }

        throw new InvalidOperationException("Failed to generate unique code after maximum retries");
    }

    private string GenerateUniqueCode(int length)
    {
        var bytes = new byte[4];
        var chars = new char[length];

        for (int i = 0; i < length; i++)
        {
            _rng.GetBytes(bytes);
            var value = BitConverter.ToUInt32(bytes, 0);
            chars[i] = ValidChars[(int)(value % ValidChars.Length)];
        }

        return new string(chars);
    }
}
