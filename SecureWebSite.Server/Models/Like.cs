using System.ComponentModel.DataAnnotations;

namespace SecureWebSite.Server.Models
{
    public class Like
    {
        [Key]
        public int LikeID { get; set; }

        [Required]
        public string UserID { get; set; } // Foreign key for the user

        [Required]
        public int ImageID { get; set; } // Foreign key for the image

        public bool IsLoved { get; set; } // True if the user has "loved" the image

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }

}
