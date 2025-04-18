using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Lists
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Title { get; set; }

    public int Position { get; set; }

    [Required]
    public Guid BoardId { get; set; }

    // Navigation property
    [ForeignKey("BoardId")]
    public Board Board { get; set; }

    // Related Cards
    public List<Card> Cards { get; set; }
}
