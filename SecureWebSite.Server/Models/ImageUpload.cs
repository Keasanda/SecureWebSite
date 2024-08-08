using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SecureWebSite.Server.Models
{
  

        public class ImageUpload
    {

        [Key]
        public int ImageId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Category { get; set; }

        [Required]
        public string ImageURL { get; set; }

        [Required]
        public string UserId { get; set; }

    }


    
}
