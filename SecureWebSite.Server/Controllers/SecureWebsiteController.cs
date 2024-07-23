using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SecureWebSite.Server.Models;
using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SecureWebSite.Server.Data;

namespace SecureWebSite.Server.Controllers
{
    [Route("api/securewebsite")]
    [ApiController]
    public class SecureWebsiteController : ControllerBase
    {
        private readonly SignInManager<User> signInManager;
        private readonly UserManager<User> userManager;
        private readonly IPasswordHasher<User> passwordHasher;
        private readonly ISenderEmail emailSender;
        private readonly ILogger<SecureWebsiteController> logger;
        private readonly ApplicationDbContext dbContext; // Add your DbContext

        public SecureWebsiteController(SignInManager<User> sm, UserManager<User> um, IPasswordHasher<User> ph, ISenderEmail es, ILogger<SecureWebsiteController> logger, ApplicationDbContext dbContext)
        {
            signInManager = sm;
            userManager = um;
            passwordHasher = ph;
            emailSender = es;
            this.logger = logger;
            this.dbContext = dbContext;
        }

        private string ModifyConfirmationLink(string confirmationLink)
        {
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
                    Otp = null // Ensure OTP is not set during registration
                };

                var result = await userManager.CreateAsync(newUser, user.PasswordHash);

                if (!result.Succeeded)
                {
                    var errorMessages = result.Errors.Select(e => e.Description).ToList();
                    logger.LogWarning("User registration failed: {Errors}", string.Join(", ", errorMessages));
                    return BadRequest(new { errors = errorMessages });
                }

                var token = await userManager.GenerateEmailConfirmationTokenAsync(newUser);
                logger.LogInformation("Email confirmation token generated for user {UserId}", newUser.Id);

                await userManager.SetAuthenticationTokenAsync(newUser, "CustomProvider", "EmailConfirmation", token);

                var encodedToken = WebUtility.UrlEncode(token);
                var confirmationLink = Url.Action(nameof(ConfirmEmail), "SecureWebsite", new { email = newUser.Email, token = encodedToken }, Request.Scheme);
                logger.LogInformation("Confirmation link generated: {ConfirmationLink}", confirmationLink);

                var modifiedLink = ModifyConfirmationLink(confirmationLink);
                logger.LogInformation("Modified confirmation link: {ModifiedLink}", modifiedLink);

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

        [HttpPost("verifyotp")]
        public async Task<ActionResult> VerifyOtp(OtpVerificationModel model)
        {
            var email = HttpContext.Session.GetString("otpUserEmail");
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Session expired. Please log in again." });
            }

            if (string.IsNullOrEmpty(model.Otp))
            {
                return BadRequest(new { message = "OTP is required." });
            }

            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return BadRequest(new { message = "User not found." });
            }

            if (user.Otp != model.Otp)
            {
                return BadRequest(new { message = "Invalid OTP." });
            }

            logger.LogInformation("OTP verified successfully for email: {Email}, OTP: {Otp}", email, model.Otp);

            user.Otp = null;
            await userManager.UpdateAsync(user);
            await signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new { message = "OTP verified successfully.", user = user });
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

            logger.LogInformation("Password reset email sent to {Email}", model.Email);
            return Ok(new { message = "Password reset email sent. Please check your inbox." });
        }

        [HttpPost("resetpassword")]
        public async Task<ActionResult> ResetPassword(ResetPasswordModel model)
        {
            if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Token) || string.IsNullOrEmpty(model.Password))
            {
                logger.LogWarning("Reset password attempt with missing data.");
                return BadRequest(new { message = "Email, token, and new password are required." });
            }

            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                logger.LogWarning("Reset password attempt for non-existent email {Email}", model.Email);
                return BadRequest(new { message = "User with this email does not exist." });
            }

            // Fetch user's old passwords
            var oldPasswords = await dbContext.UserPasswordHistory
                .Where(p => p.UserId == user.Id)
                .Select(p => p.PasswordHash)
                .ToListAsync();

            // Check if the new password is the same as any old password
            foreach (var oldPassword in oldPasswords)
            {
                if (passwordHasher.VerifyHashedPassword(user, oldPassword, model.Password) == PasswordVerificationResult.Success)
                {
                    logger.LogWarning("User tried to reset password with an old password {UserId}", user.Id);
                    return BadRequest(new { message = "New password cannot be the same as any of the old passwords." });
                }
            }

            var result = await userManager.ResetPasswordAsync(user, model.Token, model.Password);
            if (!result.Succeeded)
            {
                var errorMessages = result.Errors.Select(e => e.Description).ToList();
                logger.LogWarning("Password reset failed: {Errors}", string.Join(", ", errorMessages));
                return BadRequest(new { errors = errorMessages });
            }

            // Store the current password hash in the password history table
            dbContext.UserPasswordHistory.Add(new UserPasswordHistory
            {
                UserId = user.Id,
                PasswordHash = user.PasswordHash
            });
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Password reset successful for user {UserId}", user.Id);
            return Ok(new { message = "Password reset successful." });
        }
    }
}
