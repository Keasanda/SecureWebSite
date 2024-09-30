using Microsoft.AspNetCore.Identity; // Importing ASP.NET Core Identity
using Microsoft.EntityFrameworkCore; // Importing Entity Framework Core
using SecureWebSite.Server.Data; // Importing application data context
using SecureWebSite.Server.Models; // Importing application models
using System.Net.Mail; // Importing mail classes
using System.Net; // Importing networking classes

namespace SecureWebSite.Server // Defining the application namespace
{
    public class Program // Main application class
    {
        public static void Main(string[] args) // Entry point of the application
        {
            // Creating a builder for the web application
            var builder = WebApplication.CreateBuilder(args);

            // Adding logging services
            builder.Logging.AddConsole(); // Console logging
            builder.Logging.AddDebug(); // Debug logging
            builder.Logging.AddEventSourceLogger(); // Event source logging

            // Registering email sender service
            builder.Services.AddTransient<ISenderEmail, EmailSender>();

            // Adding controller services
            builder.Services.AddControllers();
            builder.Services.AddAuthorization(); // Adding authorization services

            // Configuring the database context with SQL Server
            builder.Services.AddDbContext<ApplicationDbContext>(options => {
                options.UseSqlServer(builder.Configuration.GetConnectionString("Default")); // Connection string from configuration
            });

            // Setting up Identity API endpoints with Entity Framework stores
            builder.Services.AddIdentityApiEndpoints<User>().AddEntityFrameworkStores<ApplicationDbContext>();

            // Configuring identity options
            builder.Services.AddIdentityCore<User>(options => {
                options.SignIn.RequireConfirmedAccount = true; // Require confirmed accounts for sign-in
                options.Password.RequireDigit = true; // Require digits in passwords
                options.Password.RequireNonAlphanumeric = true; // Require non-alphanumeric characters in passwords
                options.Password.RequireUppercase = true; // Require uppercase letters in passwords
                options.Password.RequiredLength = 8; // Minimum password length
                options.Password.RequiredUniqueChars = 4; // Minimum unique characters in password
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5); // Default lockout time
                options.Lockout.MaxFailedAccessAttempts = 3; // Max failed access attempts before lockout
                options.Lockout.AllowedForNewUsers = true; // Allow lockout for new users
                options.SignIn.RequireConfirmedEmail = true; // Require confirmed email for sign-in
                options.User.AllowedUserNameCharacters = // Allowed characters in usernames
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = true; // Require unique email addresses
            })
            .AddEntityFrameworkStores<ApplicationDbContext>() // Configuring Entity Framework stores
            .AddDefaultTokenProviders(); // Adding default token providers for password resets, etc.

            // Adding the IHttpClientFactory service for HTTP requests
            builder.Services.AddHttpClient();

            var app = builder.Build(); // Building the web application

            // Configuring middleware
            app.UseDefaultFiles(); // Serving default files (like index.html)
            app.UseStaticFiles(); // Serving static files

            // Configuring static file options for gallery pictures
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
                    Path.Combine(builder.Environment.ContentRootPath, "Gallery pics")), // Path to gallery pics
                RequestPath = "/gallery" // URL path for accessing gallery
            });

            app.UseHttpsRedirection(); // Redirecting HTTP requests to HTTPS
            app.UseAuthorization(); // Enabling authorization middleware

            // Mapping identity API and controllers
            app.MapIdentityApi<User>(); // Mapping Identity API routes
            app.MapControllers(); // Mapping controller routes
            app.MapFallbackToFile("/index.html"); // Fallback to index.html for single-page apps

            app.Run(); // Running the web application
        }
    }
}
