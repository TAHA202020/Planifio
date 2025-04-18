using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Board
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    // Foreign Key to User
    [Required]
    public string UserEmail { get; set; }

    // Navigation property
    [ForeignKey("UserEmail")]
    public User User { get; set; }
}
