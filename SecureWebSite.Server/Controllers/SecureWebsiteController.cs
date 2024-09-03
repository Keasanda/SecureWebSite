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
using System.Security.Claims;
using QRCoder; // Ensure this is correct
using System.Drawing;


namespace SecureWebSite.Server.Controllers
{
    // Defines the route for this controller and marks it as an API controller
    [Route("api/securewebsite")]
    [ApiController]
    public class SecureWebsiteController : ControllerBase
    {
        // Declare dependencies
        private readonly SignInManager<User> signInManager;
        private readonly UserManager<User> userManager;
        private readonly IPasswordHasher<User> passwordHasher;
        private readonly ISenderEmail emailSender;
        private readonly ILogger<SecureWebsiteController> logger;
        private readonly ApplicationDbContext dbContext; // Add your DbContext

        // Constructor to initialize the dependencies
        public SecureWebsiteController(SignInManager<User> sm, UserManager<User> um, IPasswordHasher<User> ph, ISenderEmail es, ILogger<SecureWebsiteController> logger, ApplicationDbContext dbContext)
        {
            signInManager = sm;
            userManager = um;
            passwordHasher = ph;
            emailSender = es;
            this.logger = logger;
            this.dbContext = dbContext;
        }

        // Helper method to modify the confirmation link
        private string ModifyConfirmationLink(string confirmationLink)
        {
            return confirmationLink.Replace("api/securewebsite/", "");
        }

        // Endpoint for registering a new user
        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(User user)
        {
            try
            {
                // Create a new user object
                User newUser = new User
                {
                    Name = user.Name,
                    Email = user.Email,
                    UserName = user.UserName,
                    Otp = null // Ensure OTP is null at registration
                };

                // Create the user in the database
                var result = await userManager.CreateAsync(newUser, user.PasswordHash);

                // Check if user creation was successful
                if (!result.Succeeded)
                {
                    var errorMessages = result.Errors.Select(e => e.Description).ToList();
                    logger.LogWarning("User registration failed: {Errors}", string.Join(", ", errorMessages));
                    return BadRequest(new { errors = errorMessages });
                }

                // Add password history for the user
                dbContext.UserPasswordHistory.Add(new UserPasswordHistory
                {
                    UserId = newUser.Id,
                    PasswordHash = userManager.PasswordHasher.HashPassword(newUser, user.PasswordHash)
                });
                await dbContext.SaveChangesAsync();

                // Generate email confirmation token
                var token = await userManager.GenerateEmailConfirmationTokenAsync(newUser);
                logger.LogInformation("Email confirmation token generated for user {UserId}", newUser.Id);

                // Store the email confirmation token
                await userManager.SetAuthenticationTokenAsync(newUser, "CustomProvider", "EmailConfirmation", token);

                // Generate and log the confirmation link
                var encodedToken = WebUtility.UrlEncode(token);
                var confirmationLink = Url.Action(nameof(ConfirmEmail), "SecureWebsite", new { email = newUser.Email, token = encodedToken }, Request.Scheme);
                logger.LogInformation("Confirmation link generated: {ConfirmationLink}", confirmationLink);

                // Modify and log the confirmation link
                var modifiedLink = ModifyConfirmationLink(confirmationLink);
                logger.LogInformation("Modified confirmation link: {ModifiedLink}", modifiedLink);

                // Send the confirmation email
                // Email template for registration confirmation
                string confirmationEmailTemplate = $@"
    <h1>Welcome to Image App Gallery</h1>
    <h3>Dear {user.Name}</h3>
    <p>We are thrilled to have you join our community. At <span style='color: #2187AB;'>ImageApp Gallery</span>, we strive to provide you with the best experience for exploring and sharing stunning images.</p>
    <p>Thank you for signing up! Here are a few things you can do to get started:</p>
    <ul>
        <li>Explore our extensive collection of images.</li>
        <li>Upload and share your own amazing photos.</li>
        <li>Connect with other photography enthusiasts.</li>
    </ul>
    <div style='padding: 0 0 10px;'>
        <h4>Before you can login, please click the button below to activate your account.</h4>
        <a href='{modifiedLink}'
        style='
            padding: 10px 15px;
            border-radius: 4px;
            margin: 10px auto;
            background-color: #2187AB;
            color: #E9F5F9; 
            height: 40px;
            text-decoration: none;'
        >Confirm Email
        </a>
    </div>
    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <h4>Signature</h4>
    <p>Best regards,</p>
    <p>The ImageApp Gallery Team</p>";

                await emailSender.SendEmailAsync(user.Email, "Image Gallery App Email Confirmation", confirmationEmailTemplate, true);
                logger.LogInformation("Confirmation email sent to {Email}", user.Email);

                // Return success response
                return Ok(new { message = "Registered Successfully. Please check your email to confirm your account." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during user registration.");
                return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
            }
        }

        // Endpoint to confirm email
        [HttpGet("confirmemail")]
        public async Task<IActionResult> ConfirmEmail(string token, string email)
        {
            logger.LogInformation("ConfirmEmail endpoint hit with token: {Token} and email: {Email}", token, email);

            // Validate email and token
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
            {
                logger.LogWarning("Email or token is null or empty.");
                return BadRequest(new { message = "Email and Token are required." });
            }

            // Find the user by email
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                logger.LogWarning("User with email {Email} not found.", email);
                return BadRequest(new { message = "User not found." });
            }

            // Confirm the user's email
            var result = await userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                logger.LogInformation("User with email {Email} successfully confirmed email.", email);
                return Ok(new { message = "Email confirmed successfully!" });
            }

            logger.LogError("Error confirming email for user with email {Email}: {Error}", email, result.Errors.FirstOrDefault()?.Description);
            return BadRequest(new { message = "Error confirming your email." });
        }

        // Endpoint to login a user
        [HttpPost("login")]
        public async Task<ActionResult> LoginUser(Login login)
        {
            try
            {
                // Find the user by email
                var user = await userManager.FindByEmailAsync(login.Email);

                // Check if user exists
                if (user == null)
                {
                    logger.LogWarning("Login attempt failed for non-existent email {Email}", login.Email);
                    return BadRequest(new { message = "Please check your credentials and try again." });
                }

                // Check if the user's email is confirmed
                if (!user.EmailConfirmed)
                {
                    logger.LogWarning("Login attempt for unconfirmed email {Email}", login.Email);
                    return Unauthorized(new { message = "Email not confirmed yet." });
                }

                // Attempt to sign in the user
                var result = await signInManager.PasswordSignInAsync(user, login.Password, login.Remember, lockoutOnFailure: true);



                if (result.Succeeded)
                {
                    if (await userManager.GetTwoFactorEnabledAsync(user))
                    {
                        // Redirect to OTP verification
                        HttpContext.Session.SetString("otpUserEmail", user.Email);
                        return Ok(new { message = "Two-factor authentication required. Redirecting...", redirectTo = "/verify-otp" });
                    }

                    // If 2FA is not enabled, proceed as normal
                    user.LastLogin = DateTime.Now;
                    var updateResult = await userManager.UpdateAsync(user);
                    if (!updateResult.Succeeded)
                    {
                        logger.LogWarning("Failed to update last login time for user {UserId}", user.Id);
                        return BadRequest(new { message = "Failed to update last login time." });
                    }

                    logger.LogInformation("User {UserId} logged in successfully", user.Id);
                    return Ok(new { message = "Login successful.", userName = user.Name, userEmail = user.Email, userID = user.Id });
                }



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
                    return Ok(new { message = "Login successful.", userName = user.Name, userEmail = user.Email ,  userID = user.Id});
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
                return BadRequest(new { message = "An error occurred. Please try again." });
            }
        }

        

        [HttpGet("logout"), Authorize]
        public async Task<ActionResult> LogoutUser()
        {
            try
            {
                await signInManager.SignOutAsync();
                logger.LogInformation("User logged out successfully.");
                return Ok(new { message = "Logout successful", redirectTo = "/LogoutPage" });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during logout.");
                return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
            }
        }

        // Endpoint to initiate forgot password process
        [HttpPost("forgotpassword")]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordModel model)
        {
            // Find the user by email
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null || !(await userManager.IsEmailConfirmedAsync(user)))
            {
                logger.LogWarning("Forgot password attempt for non-existent or unconfirmed email {Email}", model.Email);
                return BadRequest(new { message = "User with this email does not exist or email is not confirmed." });
            }

            // Generate password reset token
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);
            var resetLink = $"https://localhost:5173/resetpassword?email={model.Email}&token={encodedToken}";

            // Send the reset password email
            // Email template for password reset
            string resetPasswordEmailTemplate = $@"
    <h1>Password reset for Image App Gallery</h1>
    <h3>Hi {user.Name}</h3>
    <p>We received a request to reset the password for your account associated with this email address. If you did not make this request, please ignore this email.</p>
    <div style='padding: 0 0 10px;'>
        <h4>To reset your password, please click the button below:</h4>
        <a href='{resetLink}'
        style='
            padding: 10px 15px;
            border-radius: 4px;
            margin: 10px auto;
            background-color: #2187AB;
            color: #E9F5F9; 
            height: 40px;
            text-decoration: none;'
        >Reset Password
        </a>
    </div>
    <p>This link will expire in 24 hours. If you encounter any issues, please reach out to our support team.</p>
    <p>Thank you,</p>
    <h4>Signature</h4>
    <p>Best regards,</p>
    <p>The ImageApp Gallery Team</p>";

            await emailSender.SendEmailAsync(model.Email, "Reset Password", resetPasswordEmailTemplate, true);


            logger.LogInformation("Password reset email sent to {Email}", model.Email);
            return Ok(new { message = "Password reset email sent. Please check your inbox." });
        }

        // Endpoint to reset password
        [HttpPost("resetpassword")]
        public async Task<ActionResult> ResetPassword(ResetPasswordModel model)
        {
            // Validate the input
            if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Token) || string.IsNullOrEmpty(model.Password))
            {
                logger.LogWarning("Reset password attempt with missing data.");
                return BadRequest(new { message = "Email, token, and new password are required." });
            }

            // Find the user by email
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

            // Reset the user's password
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

        // Endpoint to get user info
        [HttpGet("home/{email}"), Authorize]
        public async Task<IActionResult> GetUserInfo(string email)
        {
            // Validate email input
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            // Find the user by email
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Return user info
            var userInfo = new
            {
                user.Name,
                user.Email,
                user.LastLogin
            };

            return Ok(new { userInfo });
        }

        // Endpoint to check if a user is logged in
        [HttpGet("xhtlekd")]
        public async Task<ActionResult> CheckUser()
        {
            User currentuser = new();

            try
            {
                var user_ = HttpContext.User;
                var principals = new ClaimsPrincipal(user_);
                var result = signInManager.IsSignedIn(principals);
                if (result)
                {
                    currentuser = await signInManager.UserManager.GetUserAsync(principals);
                }
                else
                {
                    return Forbid();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Something went wrong please try again. " + ex.Message });
            }

            return Ok(new { message = "Logged in", user = currentuser });
        }


        // Endpoint to reset password for logged-in user
        [HttpPost("loggedinresetpassword")]
        public async Task<ActionResult> LoggedInResetPassword(LoggedInResetPasswordModel model)
        {
            // Extract the user details from the token or session
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return BadRequest(new { message = "User is not logged in." });
            }

            // Find the user by ID
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found." });
            }

            // Fetch user's old passwords
            var oldPasswords = await dbContext.UserPasswordHistory
                .Where(p => p.UserId == user.Id)
                .Select(p => p.PasswordHash)
                .ToListAsync();

            // Check if the new password is the same as any old password
            foreach (var oldPassword in oldPasswords)
            {
                if (passwordHasher.VerifyHashedPassword(user, oldPassword, model.NewPassword) == PasswordVerificationResult.Success)
                {
                    return BadRequest(new { message = "New password cannot be the same as any of the old passwords." });
                }
            }

            // Change the user's password without current password check
            user.PasswordHash = userManager.PasswordHasher.HashPassword(user, model.NewPassword);
            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errorMessages = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(new { errors = errorMessages });
            }

            // Store the current password hash in the password history table
            dbContext.UserPasswordHistory.Add(new UserPasswordHistory
            {
                UserId = user.Id,
                PasswordHash = user.PasswordHash
            });
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Password reset successful." });
        }


        [HttpGet("generate-qr-code")]
        public async Task<IActionResult> GenerateQrCodeForTfa()
        {
            var user = await userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found." });
            }

            // Generate TOTP key
            var authenticatorKey = await userManager.GetAuthenticatorKeyAsync(user);
            if (string.IsNullOrEmpty(authenticatorKey))
            {
                await userManager.ResetAuthenticatorKeyAsync(user);
                authenticatorKey = await userManager.GetAuthenticatorKeyAsync(user);
            }

            // Generate QR Code
            var qrCodeUri = GenerateQrCodeUri(user.Email, authenticatorKey);
            using (var qrCodeGenerator = new QRCodeGenerator())
            using (var qrCodeData = qrCodeGenerator.CreateQrCode(qrCodeUri, QRCodeGenerator.ECCLevel.Q))
            using (var qrCode = new QRCode(qrCodeData))
            using (var qrCodeBitmap = qrCode.GetGraphic(20))
            using (var stream = new MemoryStream())
            {
                qrCodeBitmap.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                var qrCodeBase64 = Convert.ToBase64String(stream.ToArray());
                return Ok(new { qrCodeUri, qrCodeBase64 });
            }
        }


        private string GenerateQrCodeUri(string email, string key)
        {
            return $"otpauth://totp/{Uri.EscapeDataString("SecureWebSite")}:{Uri.EscapeDataString(email)}?secret={key}&issuer={Uri.EscapeDataString("SecureWebSite")}&digits=6";
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(OtpVerificationModel model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { message = "User not found." });
            }

            // Verify OTP
            var verificationResult = await userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultAuthenticatorProvider, model.Otp);
            if (!verificationResult)
            {
                return BadRequest(new { message = "Invalid OTP." });
            }

            logger.LogInformation("OTP verified successfully for email: {Email}", model.Email);

            // Complete the login process
            await signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new { message = "OTP verified successfully. Redirecting to home page...", redirectTo = "/home" });
        }


    }
}
