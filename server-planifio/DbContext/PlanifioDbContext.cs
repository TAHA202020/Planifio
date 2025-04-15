using Microsoft.EntityFrameworkCore;
public class PlanifioDbContext : DbContext
{
    public PlanifioDbContext(DbContextOptions<PlanifioDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
}