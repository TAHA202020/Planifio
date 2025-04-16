using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


[Route("project")]
public class ProjectController:ControllerBase
{
    private readonly PlanifioDbContext _context;

    public ProjectController(PlanifioDbContext context)
    {
        _context = context;
    }


    [Authorize]
    [HttpPost("create")]
    public async Task<JsonResult> CreateProject([FromBody] Project project)
    {
        Console.WriteLine(User.FindFirst(ClaimTypes.Email)?.Value);
        if (project == null || string.IsNullOrEmpty(project.Name))
        {
            return new JsonResult(new { status = "error", message = "Invalid project data" });
        }
        project.UserEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return new JsonResult(new { status = "success", message = "Project created successfully" });
    }
}