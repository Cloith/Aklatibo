using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using AklatiboBackend.Data;

namespace AklatiboBackend.Controllers;

[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public BooksController(
        ApplicationDbContext context,
        IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetBooks()
    {
        var books = await _context.Books.ToListAsync();

        return Ok(books);
    }

    [HttpGet("{slug}/pages")]
    public async Task<IActionResult> GetPages(string slug)
    {
        var book = await _context.Books
            .FirstOrDefaultAsync(b => b.Slug == slug);

        if (book == null)
        {
            return NotFound();
        }

        var pagesFile = Path.Combine(
            _environment.ContentRootPath,
            "e-books",
            book.Category.ToLower(),
            book.Slug,
            "pages.json"
        );

        if (!System.IO.File.Exists(pagesFile))
        {
            return NotFound("pages.json not found");
        }

        var json = await System.IO.File.ReadAllTextAsync(pagesFile);

        return Content(json, "application/json");
    }
}