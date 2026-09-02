using NexusApi.Models.Auth;

namespace NexusApi.Services;

public class ChangePasswordResult
{
    public bool Success { get; init; }
    public string? Error { get; init; }

    public static ChangePasswordResult Ok() => new() { Success = true };
    public static ChangePasswordResult Fail(string error) => new() { Success = false, Error = error };
}

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(string email, string password);
    Task<ChangePasswordResult> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
}