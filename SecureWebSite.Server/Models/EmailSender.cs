using System; // Importing basic types
using System.Net; // Importing networking types
using System.Net.Mail; // Importing classes for sending emails
using System.Threading.Tasks; // Importing Task for asynchronous programming
using Microsoft.Extensions.Configuration; // Importing configuration management

namespace SecureWebSite.Server.Models // Defining the models namespace
{
    // Interface for sending emails
    public interface ISenderEmail
    {
        Task SendEmailAsync(string toEmail, string subject, string body, bool isBodyHtml = false); // Method signature for sending email
    }

    // Implementation of ISenderEmail interface for sending emails
    public class EmailSender : ISenderEmail
    {
        private readonly SmtpClient _smtpClient; // SMTP client for sending emails
        private readonly ILogger<EmailSender> _logger; // Logger for logging email sending status

        // Constructor to initialize SMTP client and logger using configuration settings
        public EmailSender(IConfiguration configuration, ILogger<EmailSender> logger)
        {
            // Configuring the SMTP client with settings from configuration
            _smtpClient = new SmtpClient
            {
                Host = configuration["EmailSettings:Host"], // SMTP server host
                Port = int.Parse(configuration["EmailSettings:Port"]), // SMTP server port
                EnableSsl = bool.Parse(configuration["EmailSettings:EnableSsl"]), // SSL configuration
                Credentials = new NetworkCredential(
                    configuration["EmailSettings:Username"], // Username for SMTP authentication
                    configuration["EmailSettings:Password"] // Password for SMTP authentication
                )
            };

            _logger = logger; // Initializing logger
        }

        // Asynchronous method to send an email
        public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml)
        {
            try
            {
                // Creating a new mail message
                var mailMessage = new MailMessage
                {
                    From = new MailAddress("no-reply@example.com"), // Sender's email address
                    Subject = subject, // Email subject
                    Body = body, // Email body
                    IsBodyHtml = isHtml // Specifies if the body is HTML
                };

                mailMessage.To.Add(toEmail); // Adding recipient's email address

                // Sending the email asynchronously
                await _smtpClient.SendMailAsync(mailMessage);

                // Logging information about the sent email
                _logger.LogInformation("Email sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                // Logging any errors that occur while sending the email
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw; // Rethrow the exception for further handling
            }
        }
    }
}
