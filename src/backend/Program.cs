using Microsoft.Extensions.FileProviders;
using Microsoft.EntityFrameworkCore;
using AklatiboBackend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AklatiboBackend.Services;

var builder = WebApplication.CreateBuilder(args);
var jwtSettings = builder.Configuration.GetSection("Jwt");


// Enable Cross-Origin Resource Sharing (CORS) so your mobile app can fetch assets across LAN
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers(); 

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
       options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["Key"]!)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// --- THE FIX: MIDDLEWARE EXECUTION PIPELINE ORDER ---

// 1. CORS must execute FIRST to append access headers before any routing mechanics happen
app.UseCors();

// 2. Static file serving should execute early so image/PDF requests skip routing overhead
var ebooksPath = Path.Combine(builder.Environment.ContentRootPath, "e-books");
if (Directory.Exists(ebooksPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(ebooksPath),
        RequestPath = "/cdn/books",
        ServeUnknownFileTypes = true // Ensures PDFs stream correctly without complex MIME mapping configuration
    });
}

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers(); 

app.MapGet("/", () => "Aklatibo Central Asset Delivery Node Operational.");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    db.Database.Migrate();
    
    await BookSeeder.SeedAsync(db);
}

app.Run();