using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SecureWebSite.Server.Models
{
    // Interface for sending emails
    public interface ISenderEmail
    {
        Task SendEmailAsync(string toEmail, string subject, string body, bool isBodyHtml = false);
    }

    // Class for sending emails using SMTP
    public class EmailSender : ISenderEmail
    {
        // Dependency injection for IConfiguration
        private readonly IConfiguration _configuration;

        // Constructor with dependency injection
        public EmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Method for sending emails
        public async Task SendEmailAsync(string toEmail, string subject, string body, bool isBodyHtml = false)
        {
            // Get email settings from configuration
            string mailServer = _configuration["EmailSettings:MailServer"];
            string fromEmail = _configuration["EmailSettings:FromEmail"];
            string password = _configuration["EmailSettings:Password"];
            int port = int.Parse(_configuration["EmailSettings:MailPort"]);

            // Create a new SMTP client
            using (var client = new SmtpClient(mailServer, port))
            {
                // Set the client's credentials and enable SSL
                client.Credentials = new NetworkCredential(fromEmail, password);
                client.EnableSsl = true;

                // Create a new MailMessage object
                var mailMessage = new MailMessage(fromEmail, toEmail, subject, body)
                {
                    IsBodyHtml = isBodyHtml
                };

                // Send the email asynchronously
                await client.SendMailAsync(mailMessage);
            }
        }
    }
}