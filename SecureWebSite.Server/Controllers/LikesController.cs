using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureWebSite.Server.Data;
using SecureWebSite.Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;



namespace SecureWebSite.Server.Controllers
{
    [Route("api/Likes")]
    [ApiController]
    public class LikesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LikesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{imageId}")]
        public async Task<IActionResult> ToggleLike(int imageId, [FromBody] string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "User ID is required." });
            }

            var like = await _context.Likes
                .FirstOrDefaultAsync(l => l.UserID == userId && l.ImageID == imageId);

            if (like == null)
            {
                // User has not liked the image before, so we add a new like
                like = new Like
                {
                    UserID = userId,
                    ImageID = imageId,
                    IsLoved = true
                };
                _context.Likes.Add(like);
            }
            else
            {
                // User is toggling their like status
                like.IsLoved = !like.IsLoved;
                _context.Entry(like).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();

            return Ok(new { isLoved = like.IsLoved });
        }

        [HttpGet("love-count/{imageId}")]
        public async Task<IActionResult> GetLoveCount(int imageId)
        {
            var loveCount = await _context.Likes
                .Where(l => l.ImageID == imageId && l.IsLoved)
                .CountAsync();

            return Ok(new { Count = loveCount });
        }

        [HttpGet("user-love/{userId}/{imageId}")]
        public async Task<IActionResult> HasUserLoved(int imageId, string userId)
        {
            var love = await _context.Likes
                .FirstOrDefaultAsync(l => l.UserID == userId && l.ImageID == imageId && l.IsLoved);

            return Ok(new { isLoved = love != null });
        }

        [HttpPost("love-counts")]
        public async Task<IActionResult> GetLoveCounts([FromBody] List<int> imageIds)
        {
            if (imageIds == null || !imageIds.Any())
            {
                return BadRequest(new { message = "Image IDs are required." });
            }

            var loveCounts = await _context.Likes
                .Where(l => imageIds.Contains(l.ImageID) && l.IsLoved)
                .GroupBy(l => l.ImageID)
                .Select(group => new { ImageID = group.Key, Count = group.Count() })
                .ToListAsync();

            var result = loveCounts.ToDictionary(l => l.ImageID, l => l.Count);
            return Ok(result);
        }





    }
}
