using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Files
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; }


    [Required]
    public string FileType { get; set; }

    [Required]
    public Guid CardId { get; set; }

    [ForeignKey("CardId")]
    public Card Card { get; set; }

}
