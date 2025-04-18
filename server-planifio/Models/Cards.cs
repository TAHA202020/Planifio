using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Card
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Title { get; set; }

    public string Description { get; set; }

    public int Position { get; set; }

    [Required]
    public Guid ListId { get; set; }

    // Navigation property
    [ForeignKey("ListId")]
    public Lists List { get; set; }
}
