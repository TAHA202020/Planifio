using System.ComponentModel.DataAnnotations;

public class User
{
     [Key]
    public string email { get; set; }
    public int? otp { get; set; }

    public DateTime? otp_expiration { get; set; }
}