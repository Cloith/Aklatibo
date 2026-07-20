namespace AklatiboBackend.Models;

public class User
{
    public Guid Id { get; set; }

    public string DisplayName { get; set; } = string.Empty;
    
    public string Username { get; set; } = "";

    public string FirstName { get; set; } = "";

    public string LastName { get; set; } = "";

    public string Email { get; set; } = "";

    public string PasswordHash { get; set; } = "";

    public string? GoogleId { get; set; }

    public string? ProfilePictureUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserBook> UserBooks { get; set; }
        = new List<UserBook>();
}