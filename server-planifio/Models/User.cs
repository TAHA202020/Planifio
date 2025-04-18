using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public string Email { get; set; }
     public int? otp { get; set; }

    public DateTime? otp_expiration { get; set; }

    public List<Board> Boards { get; set; }
}
