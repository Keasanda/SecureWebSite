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
}
