using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using AklatiboBackend.Models;
using AklatiboBackend.Data;
using AklatiboBackend.DTOs;

namespace AklatiboBackend.Services;

public static class BookSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        var addedCount = 0;

        var ebooksRoot =
            Path.Combine(
                Directory.GetCurrentDirectory(),
                "e-books");

        if (!Directory.Exists(ebooksRoot))
            return;

        // Get all metadata.json files recursively
        var metadataFiles =
            Directory.GetFiles(
                ebooksRoot,
                "metadata.json",
                SearchOption.AllDirectories);

        // Grab all existing slugs from DB once
        var existingSlugs =
            (await db.Books
                .Select(b => b.Slug)
                .ToListAsync())
            .ToHashSet();

        foreach (var metadataFile in metadataFiles)
        {
            try
            {
                var json =
                    await File.ReadAllTextAsync(metadataFile);

                var metadata =
                    JsonSerializer.Deserialize<BookDto>(
                        json,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                Console.WriteLine(
                    metadata == null
                        ? "Metadata is NULL"
                        : "Metadata object created");

                Console.WriteLine(
                    JsonSerializer.Serialize(
                        metadata,
                        new JsonSerializerOptions
                        {
                            WriteIndented = true
                        }));

                if (metadata == null)
                    continue;

                if (existingSlugs.Contains(metadata.Slug))
                {
                    Console.WriteLine(
                        $"[BookSeeder] Skipping existing book: {metadata.Title}");
                    continue;
                }
                
                // Uncomment the following lines for debugging purposes
                // Console.WriteLine("===== RAW JSON =====");
                // Console.WriteLine(json);
                // Console.WriteLine("====================");
                // Console.WriteLine($"Slug: {metadata.Slug}");
                // Console.WriteLine($"Title: {metadata.Title}");
                // Console.WriteLine($"Category: {metadata.Category}");
                // Console.WriteLine($"Publisher: {metadata.Publisher}");
                // Console.WriteLine($"Authors Count: {metadata.Authors?.Count}");

                db.Books.Add(new Book
                {
                    Slug = metadata.Slug,
                    Title = metadata.Title,
                    Category = metadata.Category,
                    Summary = metadata.Summary,
                    Description = metadata.Description,
                    Authors = string.Join(", ", metadata.Authors ?? []),
                    Publisher = metadata.Publisher,
                    PublishDate =
                        DateTime.TryParse(
                            metadata.PublishDate,
                            out var publishDate)
                        ? DateTime.SpecifyKind(
                            publishDate,
                            DateTimeKind.Utc)
                        : null,
                    License = metadata.License?.ShortName ?? "",
                    Language = metadata.Language,
                    Tags = string.Join(", ", metadata.Tags ?? []),
                    CoverImageUrl = metadata.CoverImageUrl,
                    PdfPath = metadata.PdfPath
                });
                existingSlugs.Add(metadata.Slug);
                addedCount++;

                Console.WriteLine(
                    $"[BookSeeder] Added: {metadata.Title}");
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"[BookSeeder] Failed to process {metadataFile}: {ex.Message}");
            }
        }

        await db.SaveChangesAsync();
        Console.WriteLine(
                    $"[BookSeeder] Total added so far: {addedCount}");
    }
}