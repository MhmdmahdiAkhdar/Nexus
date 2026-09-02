namespace NexusApi.Data.Seed;

public class SeedUserConfig
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}

public class SeedSettings
{
    public const string SectionName = "Seed";

    public SeedUserConfig Admin { get; set; } = new();
    public SeedUserConfig NormalUser { get; set; } = new();
}