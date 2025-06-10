using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
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
//Authentication using custom handler
builder.Services.AddAuthentication("JwtCookie")
    .AddScheme<AuthenticationSchemeOptions, JwtCookieAuthenticationHandler>("JwtCookie", options => { });



var app = builder.Build();
app.UseCors("AllowMyApp");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
