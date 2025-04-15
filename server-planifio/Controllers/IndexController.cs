using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Mvc;
using MimeKit;


[Route("/")]
public class AuthController : ControllerBase
{
    private readonly PlanifioDbContext _context;

    public AuthController(PlanifioDbContext context)
    {
        _context = context;
    }


    [HttpPost("auth/request-otp")]
    public async Task<string> Index([FromBody] User user)
    {
        User existingUser=await _context.Users.FindAsync(user.email);
        if(existingUser==null)
        {
            int otp=generateOtp();
             var newUser = new User {email = user.email,otp = otp,otp_expiration = DateTime.UtcNow.AddMinutes(3)};
            _context.Users.Add(newUser);
            await SendOtpToEmailAsync(user.email, otp);
            await _context.SaveChangesAsync();

            return "New user created successfully.";
        }
        if(existingUser.otp==null)
        {
            int otp=generateOtp();
            existingUser.otp=otp;
            existingUser.otp_expiration=DateTime.UtcNow.AddMinutes(3);
            await SendOtpToEmailAsync(existingUser.email, otp);
            await _context.SaveChangesAsync();
            return "OTP sent to email";
        }
        else if(isOtpExpired((DateTime)existingUser.otp_expiration))
        {
            int otp=generateOtp();
            existingUser.otp=otp;
            existingUser.otp_expiration=DateTime.UtcNow.AddMinutes(3);
            await SendOtpToEmailAsync(existingUser.email, otp);
            await _context.SaveChangesAsync();
            return "OTP sent to email";
        }
        else
        {
            return "OTP already sent. Please check your email.";
        }
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
    //TODO:Send OTP to email
    private async Task SendOtpToEmailAsync(string email, int otp)
{
    string smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME");
    string smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD");
    try
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Planifio", smtpUsername));
        message.To.Add(new MailboxAddress("", email));
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

        Console.WriteLine("OTP sent to email.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to send OTP: {ex.Message}");
    }
}
} 