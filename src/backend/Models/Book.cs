namespace AklatiboBackend.Models;

public class Book
{
    public Guid Id { get; set; }

    public string Slug { get; set; } = "";

    public string Title { get; set; } = "";

    public string Category { get; set; } = "";

    public string Summary { get; set; } = "";

    public string Description { get; set; } = "";

    public string Authors { get; set; } = "";

    public string Publisher { get; set; } = "";

    public DateTime? PublishDate { get; set; }

    public string License { get; set; } = "";

    public string Language { get; set; } = "";

    public string Tags { get; set; } = "";

    public string CoverImageUrl { get; set; } = "";

    public string PdfPath { get; set; } = "";

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;
}