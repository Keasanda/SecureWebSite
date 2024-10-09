using Microsoft.AspNetCore.Mvc; 
using Microsoft.EntityFrameworkCore; 
using SecureWebSite.Server.Data; 
using SecureWebSite.Server.Models; 
using System; 
using System.Linq; 
using System.Collections.Generic; 
using System.Threading.Tasks; 

// Defining the API route for comments
[Route("api/Comments")]
[ApiController] 
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context; // Database context for accessing comments

   
    public CommentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Comments/{imageId} - Retrieve comments for a specific image
    [HttpGet("{imageId}")]
    public async Task<IActionResult> GetComments(int imageId)
    {
        var comments = await _context.Comments
            .Where(c => c.ImageID == imageId) 
            .ToListAsync(); 

        return Ok(comments); 
    }

    // POST: api/Comments - Add a new comment
    [HttpPost]
    public async Task<IActionResult> AddComment([FromBody] Comment comment)
    {
        if (ModelState.IsValid) 
        {
            comment.CreatedDate = DateTime.UtcNow; 
            _context.Comments.Add(comment); 
            await _context.SaveChangesAsync(); 

            return Ok(comment); 
        }

        return BadRequest(ModelState); 
    }

    // PUT: api/Comments/{id} - Update an existing comment
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(int id, [FromBody] Comment updatedComment)
    {
        var comment = await _context.Comments.FindAsync(id); 
        if (comment == null)
        {
            return NotFound(); 
        }

        if (comment.UserID != updatedComment.UserID)
        {
            return Unauthorized(); 
        }

        // Update comment properties
        comment.CommentText = updatedComment.CommentText;
        comment.CreatedDate = DateTime.UtcNow;

        _context.Entry(comment).State = EntityState.Modified; 
        await _context.SaveChangesAsync();

        return NoContent(); 
    }

    // DELETE: api/Comments/{id} - Delete a specific comment
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id, [FromBody] string userId)
    {
        var comment = await _context.Comments.FindAsync(id); 

        if (comment == null)
        {
            return NotFound(); 
        }

        if (comment.UserID != userId)
        {
            return Unauthorized(); 
        }

        _context.Comments.Remove(comment); 
        await _context.SaveChangesAsync(); 

        return NoContent(); 
    }

    // GET: api/Comments/comment-count/{imageId} - Get the count of comments for a specific image
    [HttpGet("comment-count/{imageId}")]
    public async Task<IActionResult> GetCommentCount(int imageId)
    {
        var commentCount = await _context.Comments
            .Where(c => c.ImageID == imageId) 
            .CountAsync(); 

        return Ok(new { Count = commentCount }); 
    }

    // POST: api/Comments/comment-counts - Get comment counts for multiple images
    [HttpPost("comment-counts")]
    public async Task<IActionResult> GetCommentCounts([FromBody] List<int> imageIds)
    {
        var commentCounts = await _context.Comments
            .Where(c => imageIds.Contains(c.ImageID)) 
            .GroupBy(c => c.ImageID) 
            .Select(g => new { ImageID = g.Key, Count = g.Count() }) 
            .ToDictionaryAsync(g => g.ImageID, g => g.Count); 

        return Ok(commentCounts); 
    }
}
