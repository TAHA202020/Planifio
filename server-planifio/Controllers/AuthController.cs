using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

[Route("")]
public class AuthController : ControllerBase
{
    private readonly PlanifioDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(PlanifioDbContext context,IConfiguration config)
    {
        _context = context;
        _config = config;
    }


    [HttpPost("auth/request-otp")]
    public async Task<JsonResult> Index([FromBody] User user)
    {
        User existingUser=await _context.Users.FindAsync(user.Email);
        if(existingUser==null)
        {
            int otp=generateOtp();
            User newUser = new User {Email = user.Email,otp = otp,otp_expiration = DateTime.UtcNow.AddMinutes(3)};
            _context.Users.Add(newUser);
            await SendOtpToEmailAsync(user.Email, otp);
            await _context.SaveChangesAsync();

            return new JsonResult(new {status="success",message="User Created and OTP Sent to the Email"});;
        }
        if(existingUser.otp==null)
        {
            int otp=generateOtp();
            existingUser.otp=otp;
            existingUser.otp_expiration=DateTime.UtcNow.AddMinutes(3);
            await SendOtpToEmailAsync(existingUser.Email, otp);
            await _context.SaveChangesAsync();
            return new JsonResult(new {status="success",message="OTP sent to Email"});
        }
        if (existingUser.otp_expiration != null && isOtpExpired(existingUser.otp_expiration.Value))
        {
            int otp=generateOtp();
            existingUser.otp=otp;
            existingUser.otp_expiration=DateTime.UtcNow.AddMinutes(3);
            await SendOtpToEmailAsync(existingUser.Email, otp);
            await _context.SaveChangesAsync();
            return new JsonResult(new {status="success",message="OTP sent to Email"});
        }
        return new JsonResult(new {status="success",message="OTP Already sent to Email"});
        
    }
    [HttpPost("auth/validate-otp")]
    public async Task<JsonResult> ValidateOtp([FromBody] User user)
    {
        User existingUser=await _context.Users.FindAsync(user.Email);
        if(existingUser==null)
        {
            return new JsonResult(new {status="error",message="User not found"});
        }
        if(existingUser.otp==null)
        {
            return new JsonResult(new {status="error",message="OTP not sent"});
        }
        if(isOtpExpired((DateTime)existingUser.otp_expiration))
        {
            return new JsonResult(new {status="error",message="OTP expired"});
        }
        if(validateOtp((int)existingUser.otp,(int)user.otp))
        {
            existingUser.otp=null;
            existingUser.otp_expiration=null;
            await _context.SaveChangesAsync();
            return createJwtToken(user.Email);
        }
        else
        {
            return new JsonResult(new {status="error",message="Invalid OTP"});
        }
    }


    private JsonResult createJwtToken(string Email){

        var claims = new[]
        {
            new Claim(ClaimTypes.Email, Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds
        );

        return new JsonResult(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
}













    private int generateOtp()
    {
        Random random = new Random();
        int otp = random.Next(100000, 999999);
        return otp;
    }
    private bool validateOtp(int otp, int userOtp)
    {
        if (otp == userOtp)
        {
            return true;
        }
        return false;
    }
    private bool isOtpExpired(DateTime expirationTime)
    {
        if (DateTime.UtcNow > expirationTime)
        {
            return true;
        }
        return false;
    }
    //TODO:Send OTP to Email
    private async Task SendOtpToEmailAsync(string Email, int otp)
{
    string smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME");
    string smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD");
    try
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Planifio", smtpUsername));
        message.To.Add(new MailboxAddress("", Email));
        message.Subject = "Your OTP Code";

        var bodyBuilder = new BodyBuilder
        {
            TextBody = $"Your OTP code is {otp}. Please use this code to complete your verification."
        };
        message.Body = bodyBuilder.ToMessageBody();

        using (var client = new SmtpClient())
        {
            await client.ConnectAsync("smtp.gmail.com", 587, false);
            await client.AuthenticateAsync(smtpUsername, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        Console.WriteLine("OTP sent to Email.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to send OTP: {ex.Message}");
    }
}
} 