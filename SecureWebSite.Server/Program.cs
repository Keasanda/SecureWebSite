using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SecureWebSite.Server.Data;
using SecureWebSite.Server.Models;
using System.Net.Mail;
using System.Net;

namespace SecureWebSite.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Create a new WebApplicationBuilder instance
            var builder = WebApplication.CreateBuilder(args);

            // Add logging providers to the builder
            builder.Logging.AddConsole();
            builder.Logging.AddDebug();
            builder.Logging.AddEventSourceLogger();

            // Add services to the container
            // Add a transient service for sending emails
            builder.Services.AddTransient<ISenderEmail, EmailSender>();

            // Add controllers to the services
            builder.Services.AddControllers();

            // Add authorization services
            builder.Services.AddAuthorization();

            // Add a DbContext for the application database
            builder.Services.AddDbContext<ApplicationDbContext>(options => {
                // Use SQL Server as the database provider
                options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
            });

            // Add Identity API endpoints for users
            builder.Services.AddIdentityApiEndpoints<User>().AddEntityFrameworkStores<ApplicationDbContext>();

            // Add Identity Core services for users
            builder.Services.AddIdentityCore<User>(options => {
                // Require confirmed account for sign in
                options.SignIn.RequireConfirmedAccount = true;

                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 6;
                options.Password.RequiredUniqueChars = 3;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 3;
                options.Lockout.AllowedForNewUsers = true;

                // Require confirmed email for sign in
                options.SignIn.RequireConfirmedEmail = true;

                // User settings
                options.User.AllowedUserNameCharacters =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = true;
            })
            // Add Entity Framework stores for Identity Core
           .AddEntityFrameworkStores<ApplicationDbContext>()
            // Add default token providers for Identity Core
           .AddDefaultTokenProviders();

            // Build the WebApplication instance
            var app = builder.Build();

            // Use default files
            app.UseDefaultFiles();

            // Use static files
            app.UseStaticFiles();

            // Configure the HTTP request pipeline
            // Use HTTPS redirection
            app.UseHttpsRedirection();

            // Use authorization
            app.UseAuthorization();

            // Map Identity API endpoints
            app.MapIdentityApi<User>();

            // Map controllers
            app.MapControllers();

            // Map fallback to index.html
            app.MapFallbackToFile("/index.html");

            // Run the application
            app.Run();
        }
    }
}