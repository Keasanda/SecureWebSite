namespace SecureWebSite.Server.Models
{
    public class UserPasswordHistory
    {

        public int Id { get; set; }
        public string UserId { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;


    }
}
