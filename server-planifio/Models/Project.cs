using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Project
{
    [Key]
    public Guid Id { get; set; }= Guid.NewGuid();
    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    public string UserEmail { get; set; }


    [ForeignKey("UserEmail")]
    public User User { get; set; }
}