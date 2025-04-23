using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Utilities;


[Route("boards")]
public class BoardsController:ControllerBase
{
    private readonly PlanifioDbContext _context;

    public BoardsController(PlanifioDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost("lists/create")]
    public async Task<JsonResult> CreateList([FromBody] Lists lists)
    {
        try {
        int position =await GetLastPositionWithinBoard(lists.BoardId);
        lists.Position = position ;
        lists.Id = Guid.NewGuid(); 
        
        var board = await _context.Boards
            .Include(b => b.Lists) 
            .FirstOrDefaultAsync(b => b.Id == lists.BoardId);
         
        if (board == null)
        {
            return new JsonResult(new { status = "error", message = "Board not found." });
        }
        _context.Lists.Add(lists);
        await _context.SaveChangesAsync();
        
       return new JsonResult(new
{
            status = "success",
            list = new
            {
                lists.Id,
                lists.Title,
                lists.Position,
                lists.BoardId
            }
        });
        }
        catch(Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }
        
    }



    [Authorize]
    [HttpPost("create")]
    public async Task<JsonResult> Createboard([FromBody] Board board)
    {
        if (board == null || string.IsNullOrEmpty(board.Name))
        {
            return new JsonResult(new { status = "error", message = "Invalid board data" });
        }
        board.UserEmail = User.FindFirst(ClaimTypes.Email).Value;
        if(board.UserEmail == null)
        {
            return new JsonResult(new { status = "error", message = "User email not found" });
        }
        Console.WriteLine(board.Id);
        _context.Boards.Add(board);
        await _context.SaveChangesAsync();

        return new JsonResult(new { status = "success", message = "board created successfully", boardId = board.Id });
    }
    [Authorize]
    [HttpGet("get")]
    public async Task<JsonResult> GetBoards()
    {
        var userEmail = User.FindFirst(ClaimTypes.Email).Value;
        if (userEmail == null)
        {
            return new JsonResult(new { status = "error", message = "User email not found" });
        }
        var boards = await _context.Boards
        .Where(b => b.UserEmail == userEmail)
        .Select(b => new {
            b.Id,
            b.Name,
            Lists = b.Lists.Select(l => new {
                l.Id,
                l.Title,
                l.Position,
                Cards = l.Cards.Select(c => new {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Position
                }).ToList()
            }).ToList()
        })
        .ToListAsync();

        return new JsonResult(new { status = "success", boards });
    }
    public async Task<int> GetLastPositionWithinBoard(Guid boardId)
    {
        var board = await _context.Boards
            .Include(b => b.Lists)
            .FirstOrDefaultAsync(b => b.Id == boardId);
        if (board == null)
        {
            throw new Exception("Board not found.");
        }

        if (board.Lists.Count==0)
        {
            return 1; 
        }
        var lastPosition = board.Lists.Max(l => l.Position)+1;

        return lastPosition;
    }
}