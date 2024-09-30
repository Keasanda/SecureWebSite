using Microsoft.AspNetCore.Identity.EntityFrameworkCore; // Importing IdentityDbContext for user management
using Microsoft.EntityFrameworkCore; // Importing Entity Framework Core for database context
using SecureWebSite.Server.Models; // Importing application models

namespace SecureWebSite.Server.Data // Defining the data namespace
{
    // ApplicationDbContext class inherits from IdentityDbContext for user management and additional DbSets for other entities
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        // DbSet for image uploads
        public DbSet<ImageUpload> ImageUploads { get; set; }

        // DbSet for tracking user password history
        public DbSet<UserPasswordHistory> UserPasswordHistory { get; set; }

        // DbSet for comments on images
        public DbSet<Comment> Comments { get; set; }

        // DbSet for likes on images
        public DbSet<Like> Likes { get; set; }

        // Constructor to initialize the DbContext with options
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    }
}
