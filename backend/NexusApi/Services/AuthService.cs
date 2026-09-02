using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NexusApi.Models.Auth;
using NexusApi.Repositories;

namespace NexusApi.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtSettings _jwtSettings;

    public AuthService(IUserRepository userRepository, IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<LoginResponse?> LoginAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);

        // Deliberately vague on failure (no "user not found" vs "wrong password" distinction)
        // so the login endpoint doesn't leak which emails are registered.
        if (user is null || !user.IsActive)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        var (token, expiresAt) = GenerateToken(user.Id, user.Email, user.RoleId);

        return new LoginResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            RoleId = user.RoleId,
            MustChangePassword = user.MustChangePassword
        };
    }

    public async Task<ChangePasswordResult> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
            return ChangePasswordResult.Fail("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            return ChangePasswordResult.Fail("Current password is incorrect.");

        if (BCrypt.Net.BCrypt.Verify(newPassword, user.PasswordHash))
            return ChangePasswordResult.Fail("New password must be different from the current password.");

        var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword, workFactor: 11);
        await _userRepository.UpdatePasswordHashAsync(userId, newHash);

        return ChangePasswordResult.Ok();
    }

    private (string Token, DateTime ExpiresAt) GenerateToken(int userId, string email, int roleId)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, roleId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}