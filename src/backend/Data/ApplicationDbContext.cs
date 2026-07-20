using Microsoft.EntityFrameworkCore;
using AklatiboBackend.Models;

namespace AklatiboBackend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<Book> Books { get; set; }

    public DbSet<UserBook> UserBooks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserBook>()
            .HasKey(ub => new { ub.UserId, ub.BookId });

        modelBuilder.Entity<Book>()
            .HasIndex(b => b.Slug)
            .IsUnique();
    }
}