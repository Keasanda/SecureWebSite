using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureWebSite.Server.Data;
using SecureWebSite.Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

[Route("api/Comments")]
[ApiController]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{imageId}")]
    public async Task<IActionResult> GetComments(int imageId)
    {
        var comments = await _context.Comments
            .Where(c => c.ImageID == imageId)
            .ToListAsync();

        return Ok(comments);
    }


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

        comment.CommentText = updatedComment.CommentText;
        comment.CreatedDate = DateTime.UtcNow;

        _context.Entry(comment).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

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
}
