using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth; 
using AklatiboBackend.Data;
using AklatiboBackend.DTOs;
using AklatiboBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace AklatiboBackend.Controllers
{

    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public AuthController(
            IConfiguration configuration,
            ApplicationDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public class GoogleLoginRequest
        {
            public string? Token { get; set; }
        }

        private string GenerateJwtToken(User user)
        {
            var key =
                _configuration["Jwt:Key"]!;

            var issuer =
                _configuration["Jwt:Issuer"];

            var audience =
                _configuration["Jwt:Audience"];

            var claims = new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new Claim(
                    ClaimTypes.Email,
                    user.Email)
            };

            var securityKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(key));

            var credentials =
                new SigningCredentials(
                    securityKey,
                    SecurityAlgorithms.HmacSha256);

            var token =
                new JwtSecurityToken(
                    issuer,
                    audience,
                    claims,
                    expires: DateTime.UtcNow.AddDays(7),
                    signingCredentials: credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }

        [HttpPost("google")]
        public async Task<IActionResult> VerifyGoogleToken(
            [FromBody] GoogleLoginRequest request)
        {
            var clientId = _configuration["GoogleAuth:ClientId"];

            if (string.IsNullOrWhiteSpace(clientId))
            {
                Console.WriteLine("[Auth Failure] Google Client ID is not configured.");
                return StatusCode(500, "Google Client ID is not configured.");
            }

            if (string.IsNullOrWhiteSpace(request.Token))
            {
                Console.WriteLine("[Auth Failure] Authentication token is missing.");
                return BadRequest("Authentication token is missing.");
            }

            try
            {
                var validationSettings =
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { clientId }
                    };

                var payload =
                    await GoogleJsonWebSignature.ValidateAsync(
                        request.Token,
                        validationSettings);

                string googleUserId = payload.Subject;
                string email = payload.Email.ToLowerInvariant();
                string name = payload.Name;
                string pictureUrl = payload.Picture;

                // STEP 1:
                // Existing Google account?
                var user = await _context.Users
                    .FirstOrDefaultAsync(
                        u => u.GoogleId == googleUserId);

                if (user != null)
                {
                    user.LastLoginAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();

                    var token = GenerateJwtToken(user);

                    return Ok(new
                    {
                        Token = token,
                        Message = "Google login successful.",
                        User = new
                        {
                            user.Id,
                            user.Email
                        }
                    });
                }

                // STEP 2:
                // Existing email/password account?
                user = await _context.Users
                    .FirstOrDefaultAsync(
                        u => u.Email == email);

                if (user != null)
                {
                    user.GoogleId = googleUserId;

                    if (string.IsNullOrWhiteSpace(user.ProfilePictureUrl))
                    {
                        user.ProfilePictureUrl = pictureUrl;
                    }

                    user.LastLoginAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();

                    var token = GenerateJwtToken(user);

                    return Ok(new
                    {
                        Token = token,
                        Message = "Google account linked.",
                        User = new
                        {
                            user.Id,
                            user.Email,
                        }
                    });
                }

                // STEP 3:
                // Brand new user
                user = new User
                {
                    Email = email,
                    GoogleId = googleUserId,

                    FirstName = payload.GivenName ?? "",
                    LastName = payload.FamilyName ?? "",

                    ProfilePictureUrl = pictureUrl
                };

                _context.Users.Add(user);

                await _context.SaveChangesAsync();

                var newToken = GenerateJwtToken(user);

                return Ok(new
                {
                    Token = newToken,
                    Message = "Account created via Google.",
                    User = new
                    {
                        user.Id,
                        user.Email,
                    }
                });
            }
            catch (InvalidJwtException ex)
            {
                Console.WriteLine(
                    $"[Auth Failure] Cryptographic token validation failed: {ex.Message}");

                return Unauthorized("Invalid Google token.");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    $"Internal identity processing error: {ex.Message}");
            }
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("All fields are required.");
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (existingUser != null)
            {
                return BadRequest("Email already exists.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                FirstName = request.FirstName,

                LastName = request.LastName,

                Email = email,

                PasswordHash = hashedPassword
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();
            var token = GenerateJwtToken(user);

            return Created("", new
            {
                Token = token,
                user.Id,
                user.Email
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Email and Password are required.");
            }

            var input = request.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == input);

            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }

            bool passwordValid =
                BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.PasswordHash);

            if (!passwordValid)
            {
                return Unauthorized("Invalid credentials.");
            }

            user.LastLoginAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Token = token,
                Message = "Login successful.",
                User = new
                {
                    user.Id,
                    user.Email
                }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(User.Identity?.Name);
        }
    }
}