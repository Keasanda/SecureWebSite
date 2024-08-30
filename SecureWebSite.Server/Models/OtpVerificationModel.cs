namespace SecureWebSite.Server.Models
{
    public class OtpVerificationModel
    {
        public string Email { get; set; } // Ensure this property is defined
        public string Otp { get; set; }
    }
}
