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
                    logger.LogWarning("User registration failed: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                    return BadRequest(result);
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

                // Send confirmation email
                await emailSender.SendEmailAsync(user.Email, "Confirm your email", $"Please confirm your email by clicking this link: {confirmationLink}", true);
                logger.LogInformation("Confirmation email sent to {Email}", user.Email);

                return Ok(new { message = "Registered Successfully. Please check your email to confirm your account.", result = result });
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

            var decodedToken = WebUtility.UrlDecode(token);
            logger.LogInformation("Decoded token: {DecodedToken}", decodedToken);
            var result = await userManager.ConfirmEmailAsync(user, decodedToken);
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

                var result = await signInManager.PasswordSignInAsync(user, login.Password, login.Remember, lockoutOnFailure: false);

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
                    return BadRequest(new { message = "Account locked out." });
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

        [HttpGet("admin"), Authorize]
        public ActionResult AdminPage()
        {
            string[] partners = { "Raja", "Bill Gates", "Elon Musk", "Taylor Swift", "Jeff Bezos",
                                        "Mark Zuckerberg", "Joe Biden", "Putin"};

            return Ok(new { trustedPartners = partners });
        }

        [HttpGet("home/{email}"), Authorize]
        public async Task<ActionResult> HomePage(string email)
        {
            var userInfo = await userManager.FindByEmailAsync(email);
            if (userInfo == null)
            {
                logger.LogWarning("User info not found for email {Email}", email);
                return BadRequest(new { message = "Something went wrong, please try again." });
            }

            return Ok(new { userInfo = userInfo });
        }

        [HttpGet("xhtlekd")]
        public async Task<ActionResult> CheckUser()
        {
            try
            {
                var user_ = HttpContext.User;
                var principals = new ClaimsPrincipal(user_);
                var result = signInManager.IsSignedIn(principals);
                if (result)
                {
                    var currentuser = await signInManager.UserManager.GetUserAsync(principals);
                    logger.LogInformation("User {UserId} is currently signed in.", currentuser?.Id);
                    return Ok(new { message = "Logged in", user = currentuser });
                }
                else
                {
                    logger.LogWarning("No user is currently signed in.");
                    return Forbid();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during user check.");
                return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
            }
        }
    }
}
