using Microsoft.AspNetCore.Mvc;
using SecureWebSite.Server.Data;
using SecureWebSite.Server.Models;
using System.IO;
using System.Threading.Tasks;




[Route("api/ImageUpload")]
[ApiController]
public class ImageUploadController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ImageUploadController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string title, [FromForm] string description, [FromForm] string category, [FromForm] string userId)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var uploadFolder = Path.Combine(_environment.ContentRootPath, "Gallery pics");
        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }

        var filePath = Path.Combine(uploadFolder, file.FileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var imageUpload = new ImageUpload
        {
            Title = title,
            Description = description,
            Category = category,
            ImageURL = filePath, // Save the full path
            UserId = userId
        };

        _context.ImageUploads.Add(imageUpload);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Image uploaded successfully.", filePath });
    }
}




