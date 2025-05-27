
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
var builder = WebApplication.CreateBuilder(args);
DotNetEnv.Env.Load();
//controllers Services
builder.Services.AddControllers();
//cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMyApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

//database
builder.Services.AddDbContext<PlanifioDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("PlanifioContext"),
        new MySqlServerVersion(new Version(10, 4, 32))
    ));

var app = builder.Build();
app.UseCors("AllowMyApp");
app.UseWhen(ctx => ctx.Request.Path.StartsWithSegments("/boards"), builder =>
{
    builder.UseMiddleware<JwtCookieMiddleware>();
});
app.MapControllers();

app.Run();
