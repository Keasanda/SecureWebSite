using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SecureWebSite.Server.Models;

namespace SecureWebSite.Server.Data
{

   



    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public DbSet<ImageUpload> ImageUploads { get; set; }
        public DbSet<UserPasswordHistory> UserPasswordHistory { get; set; }

        public DbSet<Comment> Comments { get; set; } // Add this line

        public DbSet<Like> Likes { get; set; }


        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    }


}
