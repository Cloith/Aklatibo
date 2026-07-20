namespace AklatiboBackend.Models;

public class UserBook
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public Guid BookId { get; set; }

    public Book Book { get; set; } = null!;

    public DateTime GrantedAt { get; set; }
}