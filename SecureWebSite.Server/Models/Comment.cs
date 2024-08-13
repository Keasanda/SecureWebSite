using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SecureWebSite.Server.Models
{
    public class Comment
    {
        [Key]
        public int CommentID { get; set; }

        [Required]
        public int ImageID { get; set; }

        [Required]
        public string UserID { get; set; }

        [Required]
        public string CommentText { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; }

        // Navigation property
        public User? User { get; set; }        // Assuming a User entity exists
    }

}
