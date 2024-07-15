using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SecureWebSite.Server.Models;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using System.Linq;
using System.Net;

namespace SecureWebSite.Server.Controllers
{
    [Route("api/securewebsite")]
    [ApiController]
    public class SecureWebsiteController : ControllerBase
    {
        private readonly SignInManager<User> signInManager;
        private readonly UserManager<User> userManager;
        private readonly ISenderEmail emailSender;
        private readonly ILogger<SecureWebsiteController> logger;

        public SecureWebsiteController(SignInManager<User> sm, UserManager<User> um, ISenderEmail es, ILogger<SecureWebsiteController> logger)
        {
            signInManager = sm;
            userManager = um;
            emailSender = es;
            this.logger = logger;
        }

        // Method to modify the confirmation link
        private string ModifyConfirmationLink(string confirmationLink)
        {
            // Replace the specified part of the URL
            return confirmationLink.Replace("api/securewebsite/", "");
        }

        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(User user)
        {
            try
            {
                User newUser = new User
                {
                    Name = user.Name,
                    Email = user.Email,
                    UserName = user.UserName,
                };

                var result = await userManager.CreateAsync(newUser, user.PasswordHash);

                if (!result.Succeeded)
                {
                    var errorMessages = result.Errors.Select(e => e.Description).ToList();
                    logger.LogWarning("User registration failed: {Errors}", string.Join(", ", errorMessages));
                    return BadRequest(new { errors = errorMessages });
                }

                // Generate email confirmation token
                var token = await userManager.GenerateEmailConfirmationTokenAsync(newUser);
                logger.LogInformation("Email confirmation token generated for user {UserId}", newUser.Id);

                // Save the token to AspNetUserTokens table
                await userManager.SetAuthenticationTokenAsync(newUser, "CustomProvider", "EmailConfirmation", token);

                // Create confirmation link
                var encodedToken = WebUtility.UrlEncode(token);
                var confirmationLink = Url.Action(nameof(ConfirmEmail), "SecureWebsite", new { email = newUser.Email, token = encodedToken }, Request.Scheme);
                logger.LogInformation("Confirmation link generated: {ConfirmationLink}", confirmationLink);

                // Modify the confirmation link
                var modifiedLink = ModifyConfirmationLink(confirmationLink);
                logger.LogInformation("Modified confirmation link: {ModifiedLink}", modifiedLink);

                // Send confirmation email with the modified link
                await emailSender.SendEmailAsync(user.Email, "Confirm your email", $"Please confirm your email by clicking this link: {modifiedLink}", true);
                logger.LogInformation("Confirmation email sent to {Email}", user.Email);

                return Ok(new { message = "Registered Successfully. Please check your email to confirm your account." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during user registration.");
                return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
            }
        }



        [HttpGet("confirmemail")]
        public async Task<IActionResult> ConfirmEmail(string token, string email)
        {
            logger.LogInformation("ConfirmEmail endpoint hit with token: {Token} and email: {Email}", token, email);

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
            {
                logger.LogWarning("Email or token is null or empty.");
                return BadRequest(new { message = "Email and Token are required." });
            }

            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                logger.LogWarning("User with email {Email} not found.", email);
                return BadRequest(new { message = "User not found." });
            }

         ;
            var result = await userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                logger.LogInformation("User with email {Email} successfully confirmed email.", email);
                return Ok(new { message = "Email confirmed successfully!" });
            }

            logger.LogError("Error confirming email for user with email {Email}: {Error}", email, result.Errors.FirstOrDefault()?.Description);
            return BadRequest(new { message = "Error confirming your email." });
        }


        [HttpPost("login")]
        public async Task<ActionResult> LoginUser(Login login)
        {
            try
            {
                var user = await userManager.FindByEmailAsync(login.Email);

                if (user == null)
                {
                    logger.LogWarning("Login attempt failed for non-existent email {Email}", login.Email);
                    return BadRequest(new { message = "Please check your credentials and try again." });
                }

                if (!user.EmailConfirmed)
                {
                    logger.LogWarning("Login attempt for unconfirmed email {Email}", login.Email);
                    return Unauthorized(new { message = "Email not confirmed yet." });
                }

                var result = await signInManager.PasswordSignInAsync(user, login.Password, login.Remember, lockoutOnFailure: true);

                if (result.Succeeded)
                {
                    user.LastLogin = DateTime.Now;
                    var updateResult = await userManager.UpdateAsync(user);
                    if (!updateResult.Succeeded)
                    {
                        logger.LogWarning("Failed to update last login time for user {UserId}", user.Id);
                        return BadRequest(new { message = "Failed to update last login time." });
                    }

                    logger.LogInformation("User {UserId} logged in successfully", user.Id);
                    return Ok(new { message = "Login successful." });
                }

                if (result.RequiresTwoFactor)
                {
                    logger.LogWarning("Two-factor authentication required for user {UserId}", user.Id);
                    return BadRequest(new { message = "Two-factor authentication required." });
                }

                if (result.IsLockedOut)
                {
                    logger.LogWarning("User {UserId} is locked out", user.Id);
                    return BadRequest(new { message = "Account locked out due to multiple failed login attempts." });
                }

                logger.LogWarning("Invalid login attempt for user {UserId}", user.Id);
                return Unauthorized(new { message = "Check your login credentials and try again." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during login.");
                return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
            }
        }


        [HttpGet("logout"), Authorize]
        public async Task<ActionResult> LogoutUser()
        {
            try
            {
                await signInManager.SignOutAsync();
                logger.LogInformation("User logged out successfully.");
                return Ok(new { message = "You are free to go!" });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during logout.");
                return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
            }
        }


        [HttpPost("forgotpassword")]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordModel model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null || !(await userManager.IsEmailConfirmedAsync(user)))
            {
                logger.LogWarning("Forgot password attempt for non-existent or unconfirmed email {Email}", model.Email);
                return BadRequest(new { message = "User with this email does not exist or email is not confirmed." });
            }

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);
            var resetLink = $"https://localhost:5173/resetpassword?email={model.Email}&token={encodedToken}";

            await emailSender.SendEmailAsync(model.Email, "Reset Password", $"Please reset your password by clicking here: {resetLink}", true);

            // Log the reset token for debugging purposes
            logger.LogInformation("Password reset token generated for user {UserId}: {Token}", user.Id, token);

            // Log to console
            Console.WriteLine($"Password reset link generated: {resetLink}");

            return Ok(new { message = "Password reset link has been sent to your email." });
        }


        [HttpGet("resetpassword")]
        public IActionResult ResetPassword(string token, string email)
        {
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(email))
            {
                logger.LogWarning("Reset password attempt with invalid token or email.");
                return BadRequest(new { message = "Invalid token or email." });
            }

            return Ok(new { email, token });
        }

        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword(ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                logger.LogWarning("Reset password attempt for non-existent email {Email}", model.Email);
                return BadRequest(new { message = "User with this email does not exist." });
            }

            var result = await userManager.ResetPasswordAsync(user, model.Token, model.Password);
            if (result.Succeeded)
            {
                logger.LogInformation("Password reset successfully for user {UserId}", user.Id);
                return Ok(new { message = "Password has been reset successfully." });
            }

            logger.LogError("Error resetting password for user {UserId}: {Errors}", user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));
            return BadRequest(new { message = "Error resetting the password.", errors = result.Errors });
        }





    }
}