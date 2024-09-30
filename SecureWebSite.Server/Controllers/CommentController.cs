using Microsoft.AspNetCore.Mvc; // Importing ASP.NET Core MVC
using Microsoft.EntityFrameworkCore; // Importing Entity Framework Core for database operations
using SecureWebSite.Server.Data; // Importing the application's data context
using SecureWebSite.Server.Models; // Importing the application's models
using System; // Importing System namespace for basic functionalities
using System.Linq; // Importing LINQ for querying collections
using System.Collections.Generic; // Importing collections namespace
using System.Threading.Tasks; // Importing Task for asynchronous programming

// Defining the API route for comments
[Route("api/Comments")]
[ApiController] // Indicates that this class is an API controller
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context; // Database context for accessing comments

    // Constructor to inject the ApplicationDbContext
    public CommentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Comments/{imageId} - Retrieve comments for a specific image
    [HttpGet("{imageId}")]
    public async Task<IActionResult> GetComments(int imageId)
    {
        var comments = await _context.Comments
            .Where(c => c.ImageID == imageId) // Filter comments by imageId
            .ToListAsync(); // Asynchronously convert to a list

        return Ok(comments); // Return comments with a 200 OK response
    }

    // POST: api/Comments - Add a new comment
    [HttpPost]
    public async Task<IActionResult> AddComment([FromBody] Comment comment)
    {
        if (ModelState.IsValid) // Check if the model state is valid
        {
            comment.CreatedDate = DateTime.UtcNow; // Set the created date to the current UTC time
            _context.Comments.Add(comment); // Add the comment to the database context
            await _context.SaveChangesAsync(); // Save changes asynchronously

            return Ok(comment); // Return the added comment with a 200 OK response
        }

        return BadRequest(ModelState); // Return a 400 Bad Request if model state is invalid
    }

    // PUT: api/Comments/{id} - Update an existing comment
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(int id, [FromBody] Comment updatedComment)
    {
        var comment = await _context.Comments.FindAsync(id); // Find the comment by id

        if (comment == null)
        {
            return NotFound(); // Return 404 Not Found if the comment does not exist
        }

        if (comment.UserID != updatedComment.UserID)
        {
            return Unauthorized(); // Return 401 Unauthorized if the user does not match
        }

        // Update comment properties
        comment.CommentText = updatedComment.CommentText;
        comment.CreatedDate = DateTime.UtcNow;

        _context.Entry(comment).State = EntityState.Modified; // Mark the comment as modified
        await _context.SaveChangesAsync(); // Save changes asynchronously

        return NoContent(); // Return 204 No Content after successful update
    }

    // DELETE: api/Comments/{id} - Delete a specific comment
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id, [FromBody] string userId)
    {
        var comment = await _context.Comments.FindAsync(id); // Find the comment by id

        if (comment == null)
        {
            return NotFound(); // Return 404 Not Found if the comment does not exist
        }

        if (comment.UserID != userId)
        {
            return Unauthorized(); // Return 401 Unauthorized if the user does not match
        }

        _context.Comments.Remove(comment); // Remove the comment from the context
        await _context.SaveChangesAsync(); // Save changes asynchronously

        return NoContent(); // Return 204 No Content after successful deletion
    }

    // GET: api/Comments/comment-count/{imageId} - Get the count of comments for a specific image
    [HttpGet("comment-count/{imageId}")]
    public async Task<IActionResult> GetCommentCount(int imageId)
    {
        var commentCount = await _context.Comments
            .Where(c => c.ImageID == imageId) // Filter comments by imageId
            .CountAsync(); // Asynchronously count the comments

        return Ok(new { Count = commentCount }); // Return the comment count with a 200 OK response
    }

    // POST: api/Comments/comment-counts - Get comment counts for multiple images
    [HttpPost("comment-counts")]
    public async Task<IActionResult> GetCommentCounts([FromBody] List<int> imageIds)
    {
        var commentCounts = await _context.Comments
            .Where(c => imageIds.Contains(c.ImageID)) // Filter comments for the provided imageIds
            .GroupBy(c => c.ImageID) // Group comments by ImageID
            .Select(g => new { ImageID = g.Key, Count = g.Count() }) // Create an anonymous object with ImageID and Count
            .ToDictionaryAsync(g => g.ImageID, g => g.Count); // Convert to a dictionary

        return Ok(commentCounts); // Return the comment counts with a 200 OK response
    }
}
