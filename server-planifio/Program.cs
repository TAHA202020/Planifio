using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
DotNetEnv.Env.Load();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMyApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddDbContext<PlanifioDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("PlanifioContext"),
        new MySqlServerVersion(new Version(10, 4, 32))
    ));



var app = builder.Build();
app.UseCors("AllowMyApp");
app.MapControllers();
app.Run();
