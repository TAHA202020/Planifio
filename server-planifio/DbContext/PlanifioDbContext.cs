using Microsoft.EntityFrameworkCore;
public class PlanifioDbContext : DbContext
{
    public PlanifioDbContext(DbContextOptions<PlanifioDbContext> options) : base(options)
    {
    }
    public DbSet<Project> Projects { get; set; }
    public DbSet<User> Users { get; set; }
}