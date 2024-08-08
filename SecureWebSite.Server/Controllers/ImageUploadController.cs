using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureWebSite.Server.Data;
using SecureWebSite.Server.Models;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

[Route("api/ImageUpload")]
[ApiController]
public class ImageUploadController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public ImageUploadController(ApplicationDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string title, [FromForm] string description, [FromForm] string category, [FromForm] string userId)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        string imgurClientId = "a20f625017e0bda"; // Replace with your Imgur Client ID

        using (var httpClient = _httpClientFactory.CreateClient())
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Client-ID", imgurClientId);
            using (var content = new MultipartFormDataContent())
            {
                using (var stream = file.OpenReadStream())
                {
                    var streamContent = new StreamContent(stream);
                    streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
                    content.Add(streamContent, "image", file.FileName);

                    var response = await httpClient.PostAsync("https://api.imgur.com/3/image", content);
                    if (!response.IsSuccessStatusCode)
                    {
                        return StatusCode((int)response.StatusCode, new { message = "Error uploading image to Imgur." });
                    }

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JObject.Parse(responseContent);
                    var imageUrl = jsonResponse["data"]["link"].ToString();

                    var imageUpload = new ImageUpload
                    {
                        Title = title,
                        Description = description,
                        Category = category,
                        ImageURL = imageUrl, // Save the Imgur link
                        UserId = userId
                    };

                    _context.ImageUploads.Add(imageUpload);
                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Image uploaded successfully.", imageUrl });
                }
            }
        }
    }

    [HttpGet("images")]
    public async Task<IActionResult> GetImages()
    {
        var images = await _context.ImageUploads.ToListAsync();
        return Ok(images);
    }

    [HttpGet("images/{id}")]
    public async Task<IActionResult> GetImage(int id)
    {
        var image = await _context.ImageUploads.FindAsync(id);

        if (image == null)
        {
            return NotFound();
        }

        return Ok(image);
    }

    [HttpGet("user-images/{userId}")]
    public async Task<IActionResult> GetUserImages(string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest(new { message = "User ID is required." });
        }

        var images = await _context.ImageUploads.Where(img => img.UserId == userId).ToListAsync();

        if (images == null || !images.Any())
        {
            return NotFound(new { message = "No images found for the specified user ID." });
        }

        return Ok(images);
    }

    [HttpPut("update-image/{id}")]
    public async Task<IActionResult> UpdateImage(int id, [FromBody] ImageUpload updatedImage)
    {
        if (updatedImage == null || updatedImage.ImageId != id)
        {
            return BadRequest(new { message = "Invalid image data." });
        }

        var user = await _context.Users.FindAsync(updatedImage.UserId);

        var image = await _context.ImageUploads.FindAsync(id);
        if (image == null)
        {
            return NotFound(new { message = "Image not found." });
        }

        if (image.UserId != updatedImage.UserId)
        {
            return Unauthorized(new { message = "You are not authorized to update this image." });
        }

        image.Title = updatedImage.Title;
        image.Description = updatedImage.Description;
        image.Category = updatedImage.Category;

        try
        {
            _context.Entry(image).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating image: {ex.Message}"); // Log the error
            return StatusCode(500, new { message = "An error occurred while updating the image.", details = ex.Message });
        }
    }


    [HttpDelete("delete-image/{id}")]
    public async Task<IActionResult> DeleteImage(int id)
    {
        var image = await _context.ImageUploads.FindAsync(id);
        if (image == null)
        {
            return NotFound(new { message = "Image not found." });
        }

        _context.ImageUploads.Remove(image);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
