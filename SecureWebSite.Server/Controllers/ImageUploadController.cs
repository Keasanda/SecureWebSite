using Microsoft.AspNetCore.Mvc; // Importing ASP.NET Core MVC
using Microsoft.EntityFrameworkCore; // Importing Entity Framework Core for database operations
using SecureWebSite.Server.Data; // Importing the application's data context
using SecureWebSite.Server.Models; // Importing the application's models
using System.IO; // Importing IO namespace for file handling
using System.Net.Http; // Importing HttpClient for making HTTP requests
using System.Net.Http.Headers; // Importing headers for HTTP requests
using System.Threading.Tasks; // Importing Task for asynchronous programming
using Newtonsoft.Json.Linq; // Importing JObject for JSON manipulation

// Defining the API route for image uploads
[Route("api/ImageUpload")]
[ApiController] // Indicates that this class is an API controller
public class ImageUploadController : ControllerBase
{
    private readonly ApplicationDbContext _context; // Database context for accessing image uploads
    private readonly IHttpClientFactory _httpClientFactory; // Factory for creating HTTP clients

    // Constructor to inject ApplicationDbContext and IHttpClientFactory
    public ImageUploadController(ApplicationDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    // POST: api/ImageUpload/upload - Upload a new image
    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string title, [FromForm] string description, [FromForm] string category, [FromForm] string userId)
    {
        // Check if the uploaded file is null or empty
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        string imgurClientId = "a20f625017e0bda"; // Replace with your Imgur Client ID

        using (var httpClient = _httpClientFactory.CreateClient()) // Create a new HTTP client
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Client-ID", imgurClientId); // Set the authorization header for Imgur API

            using (var content = new MultipartFormDataContent()) // Create content for multipart form data
            {
                using (var stream = file.OpenReadStream()) // Open the file stream
                {
                    var streamContent = new StreamContent(stream); // Create content from the file stream
                    streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType); // Set content type
                    content.Add(streamContent, "image", file.FileName); // Add the file content to the request

                    // Upload the image to Imgur
                    var response = await httpClient.PostAsync("https://api.imgur.com/3/image", content);
                    if (!response.IsSuccessStatusCode) // Check if the upload was successful
                    {
                        return StatusCode((int)response.StatusCode, new { message = "Error uploading image to Imgur." });
                    }

                    var responseContent = await response.Content.ReadAsStringAsync(); // Read the response content
                    var jsonResponse = JObject.Parse(responseContent); // Parse the JSON response
                    var imageUrl = jsonResponse["data"]["link"].ToString(); // Get the image URL

                    // Create a new ImageUpload object
                    var imageUpload = new ImageUpload
                    {
                        Title = title,
                        Description = description,
                        Category = category,
                        ImageURL = imageUrl, // Save the Imgur link
                        UserId = userId
                    };

                    _context.ImageUploads.Add(imageUpload); // Add the image upload to the context
                    await _context.SaveChangesAsync(); // Save changes asynchronously

                    return Ok(new { message = "Image uploaded successfully.", imageUrl }); // Return success message and image URL
                }
            }
        }
    }

    // GET: api/ImageUpload/images - Retrieve all images
    [HttpGet("images")]
    public async Task<IActionResult> GetImages()
    {
        var images = await _context.ImageUploads.ToListAsync(); // Get all images from the database
        return Ok(images); // Return images with a 200 OK response
    }

    // GET: api/ImageUpload/images/{id} - Retrieve a specific image by ID
    [HttpGet("images/{id}")]
    public async Task<IActionResult> GetImage(int id)
    {
        var image = await _context.ImageUploads.FindAsync(id); // Find the image by ID

        if (image == null)
        {
            return NotFound(); // Return 404 Not Found if the image does not exist
        }

        return Ok(image); // Return the image with a 200 OK response
    }

    // GET: api/ImageUpload/user-images/{userId} - Retrieve images uploaded by a specific user
    [HttpGet("user-images/{userId}")]
    public async Task<IActionResult> GetUserImages(string userId)
    {
        // Check if userId is null or empty
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest(new { message = "User ID is required." });
        }

        var images = await _context.ImageUploads.Where(img => img.UserId == userId).ToListAsync(); // Get images for the specified user

        if (images == null || !images.Any()) // Check if any images were found
        {
            return NotFound(new { message = "No images found for the specified user ID." });
        }

        return Ok(images); // Return the images with a 200 OK response
    }

    // PUT: api/ImageUpload/update-image/{id} - Update an existing image
    [HttpPut("update-image/{id}")]
    public async Task<IActionResult> UpdateImage(int id, [FromBody] ImageUpload updatedImage)
    {
        // Check if the updated image is valid
        if (updatedImage == null || updatedImage.ImageId != id)
        {
            return BadRequest(new { message = "Invalid image data." });
        }

        var user = await _context.Users.FindAsync(updatedImage.UserId); // Find the user by ID
        var image = await _context.ImageUploads.FindAsync(id); // Find the image by ID

        if (image == null)
        {
            return NotFound(new { message = "Image not found." }); // Return 404 Not Found if the image does not exist
        }

        if (image.UserId != updatedImage.UserId)
        {
            return Unauthorized(new { message = "You are not authorized to update this image." }); // Return 401 Unauthorized if the user does not match
        }

        // Update image properties
        image.Title = updatedImage.Title;
        image.Description = updatedImage.Description;
        image.Category = updatedImage.Category;

        try
        {
            _context.Entry(image).State = EntityState.Modified; // Mark the image as modified
            await _context.SaveChangesAsync(); // Save changes asynchronously
            return Ok(new { message = "Image updated successfully." }); // Return success message
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating image: {ex.Message}"); // Log the error
            return StatusCode(500, new { message = "An error occurred while updating the image.", details = ex.Message }); // Return 500 Internal Server Error
        }
    }

    // DELETE: api/ImageUpload/delete-image/{id} - Delete a specific image
    [HttpDelete("delete-image/{id}")]
    public async Task<IActionResult> DeleteImage(int id)
    {
        var image = await _context.ImageUploads.FindAsync(id); // Find the image by ID
        if (image == null)
        {
            return NotFound(new { message = "Image not found." }); // Return 404 Not Found if the image does not exist
        }

        _context.ImageUploads.Remove(image); // Remove the image from the context
        await _context.SaveChangesAsync(); // Save changes asynchronously

        return NoContent(); // Return 204 No Content after successful deletion
    }

    // GET: api/ImageUpload/images-with-comments - Get images with their comment counts
    [HttpGet("images-with-comments")]
    public async Task<IActionResult> GetImagesWithCommentCounts()
    {
        var imagesWithComments = await _context.ImageUploads
            .Select(image => new
            {
                Image = image,
                CommentCount = _context.Comments.Count(c => c.ImageID == image.ImageId) // Count comments for each image
            })
            .ToListAsync(); // Convert to list asynchronously

        return Ok(imagesWithComments); // Return the images with comment counts with a 200 OK response
    }
}
