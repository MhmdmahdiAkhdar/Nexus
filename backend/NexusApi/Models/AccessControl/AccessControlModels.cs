using System.ComponentModel.DataAnnotations;

namespace NexusApi.Models.AccessControl;

public class UserListItemResponse
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class RoleOptionResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int PermissionsCount { get; set; }
}

public class CreateUserRequest
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string FullName { get; set; } = string.Empty;
    [Required] public int RoleId { get; set; }
}

public class CreateUserResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
}

public class SetUserActiveRequest
{
    public bool IsActive { get; set; }
}