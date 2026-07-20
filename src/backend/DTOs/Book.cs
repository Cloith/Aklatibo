namespace AklatiboBackend.DTOs;

public class BookDto
{
    public string Slug { get; set; } = "";

    public string Title { get; set; } = "";

    public string Category { get; set; } = "";

    public string Summary { get; set; } = "";

    public string Description { get; set; } = "";

    public List<string> Authors { get; set; } = [];

    public string Publisher { get; set; } = "";

    public string PublishDate { get; set; } = "";

    public LicenseMetadata License { get; set; } = new();

    public string Language { get; set; } = "";

    public string CoverImageUrl { get; set; } = "";

    public string PdfPath { get; set; } = "";

    public List<string> Tags { get; set; } = [];
}

public class LicenseMetadata
{
    public string Name { get; set; } = "";

    public string ShortName { get; set; } = "";

    public string Url { get; set; } = "";
}