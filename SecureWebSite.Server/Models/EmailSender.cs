using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace SecureWebSite.Server.Models
{
    public interface ISenderEmail
    {
        Task SendEmailAsync(string toEmail, string subject, string body, bool isBodyHtml = false);
    }

    public class EmailSender : ISenderEmail
    {
        private readonly IConfiguration _configuration;

        public EmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body, bool isBodyHtml = false)
        {
            string mailServer = _configuration["EmailSettings:MailServer"];
            string fromEmail = _configuration["EmailSettings:FromEmail"];
            string password = _configuration["EmailSettings:Password"];
            int port = int.Parse(_configuration["EmailSettings:MailPort"]);

            using (var client = new SmtpClient(mailServer, port))
            {
                client.Credentials = new NetworkCredential(fromEmail, password);
                client.EnableSsl = true;

                var mailMessage = new MailMessage(fromEmail, toEmail, subject, body)
                {
                    IsBodyHtml = isBodyHtml
                };

                await client.SendMailAsync(mailMessage);
            }
        }
    }
}
