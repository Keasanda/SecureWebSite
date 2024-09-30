using Microsoft.AspNetCore.Mvc; // Importing ASP.NET Core MVC
using Microsoft.EntityFrameworkCore; // Importing Entity Framework Core for database operations
using SecureWebSite.Server.Data; // Importing the application's data context
using SecureWebSite.Server.Models; // Importing the application's models
using System; // Importing System namespace for general types
using System.Linq; // Importing LINQ for query operations
using System.Threading.Tasks; // Importing Task for asynchronous programming

namespace SecureWebSite.Server.Controllers // Defining the controller namespace
{
    // Defining the API route for likes
    [Route("api/Likes")]
    [ApiController] // Indicates that this class is an API controller
    public class LikesController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Database context for accessing likes

        // Constructor to inject ApplicationDbContext
        public LikesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Likes/{imageId} - Toggle like status for a specific image by user
        [HttpPost("{imageId}")]
        public async Task<IActionResult> ToggleLike(int imageId, [FromBody] string userId)
        {
            // Check if userId is null or empty
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "User ID is required." });
            }

            // Check if the user has already liked the image
            var like = await _context.Likes
                .FirstOrDefaultAsync(l => l.UserID == userId && l.ImageID == imageId);

            if (like == null)
            {
                // User has not liked the image before, so we add a new like
                like = new Like
                {
                    UserID = userId,
                    ImageID = imageId,
                    IsLoved = true // Set the like status to true
                };
                _context.Likes.Add(like); // Add new like to the context
            }
            else
            {
                // User is toggling their like status
                like.IsLoved = !like.IsLoved; // Toggle the IsLoved property
                _context.Entry(like).State = EntityState.Modified; // Mark the like as modified
            }

            await _context.SaveChangesAsync(); // Save changes asynchronously

            return Ok(new { isLoved = like.IsLoved }); // Return the current like status
        }

        // GET: api/Likes/love-count/{imageId} - Retrieve the count of likes for a specific image
        [HttpGet("love-count/{imageId}")]
        public async Task<IActionResult> GetLoveCount(int imageId)
        {
            // Count the number of likes for the specified image
            var loveCount = await _context.Likes
                .Where(l => l.ImageID == imageId && l.IsLoved)
                .CountAsync();

            return Ok(new { Count = loveCount }); // Return the count of likes
        }

        // GET: api/Likes/user-love/{userId}/{imageId} - Check if a user has liked a specific image
        [HttpGet("user-love/{userId}/{imageId}")]
        public async Task<IActionResult> HasUserLoved(int imageId, string userId)
        {
            // Check if the user has liked the image
            var love = await _context.Likes
                .FirstOrDefaultAsync(l => l.UserID == userId && l.ImageID == imageId && l.IsLoved);

            return Ok(new { isLoved = love != null }); // Return whether the user has liked the image
        }

        // POST: api/Likes/love-counts - Retrieve like counts for multiple images
        [HttpPost("love-counts")]
        public async Task<IActionResult> GetLoveCounts([FromBody] List<int> imageIds)
        {
            // Check if imageIds is null or empty
            if (imageIds == null || !imageIds.Any())
            {
                return BadRequest(new { message = "Image IDs are required." });
            }

            // Group and count the likes for the specified image IDs
            var loveCounts = await _context.Likes
                .Where(l => imageIds.Contains(l.ImageID) && l.IsLoved)
                .GroupBy(l => l.ImageID)
                .Select(group => new { ImageID = group.Key, Count = group.Count() }) // Select image ID and like count
                .ToListAsync();

            // Convert the result to a dictionary
            var result = loveCounts.ToDictionary(l => l.ImageID, l => l.Count);
            return Ok(result); // Return the like counts
        }
    }
}
