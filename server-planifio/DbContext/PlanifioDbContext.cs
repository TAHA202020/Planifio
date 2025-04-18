using Microsoft.EntityFrameworkCore;
public class PlanifioDbContext : DbContext
{
    public PlanifioDbContext(DbContextOptions<PlanifioDbContext> options) : base(options)
    {
    }
    public DbSet<Card> Cards { get; set; }
    public DbSet<Lists> Lists { get; set; }
    public DbSet<Board> Boards { get; set; }
    public DbSet<User> Users { get; set; }
}