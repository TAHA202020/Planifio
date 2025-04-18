using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


[Route("boards")]
public class BoardsController:ControllerBase
{
    private readonly PlanifioDbContext _context;

    public BoardsController(PlanifioDbContext context)
    {
        _context = context;
    }


    [Authorize]
    [HttpPost("create")]
    public async Task<JsonResult> Createboard([FromBody] Board board)
    {
        Console.WriteLine(User.FindFirst(ClaimTypes.Email)?.Value);
        if (board == null || string.IsNullOrEmpty(board.Name))
        {
            return new JsonResult(new { status = "error", message = "Invalid board data" });
        }
        board.UserEmail = User.FindFirst(ClaimTypes.Email).Value;
        if(board.UserEmail == null)
        {
            return new JsonResult(new { status = "error", message = "User email not found" });
        }
        _context.Boards.Add(board);
        await _context.SaveChangesAsync();

        return new JsonResult(new { status = "success", message = "board created successfully" });
    }
}