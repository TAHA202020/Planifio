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
            Lists = b.Lists
                .OrderBy(l => l.Position) // Order lists by position
                .Select(l => new {
                    l.Id,
                    l.Title,
                    l.Position,
                    Cards = l.Cards
                        .OrderBy(c => c.Position) // Order cards by position
                        .Select(c => new {
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
    [HttpPost("validate-drag")]
public async Task<IActionResult> ValidateAndUpdateListPosition([FromBody] UpdateListPositionDto request)
{
        try
        {
            var boardLists = await _context.Lists
                .Where(l => l.BoardId == request.BoardId)
                .OrderBy(l => l.Position)
                .ToListAsync();
            if (boardLists == null || boardLists.Count == 0)
            {
                return NotFound("No lists found for this board");
            }
            Console.WriteLine($"Found {boardLists.Count} lists for board with ID {request.BoardId}");
            var oldPositions = boardLists.Select(l => new { l.Id, l.Position }).ToList();
            foreach (var list in boardLists.Where(l => l.Position >= request.NewPosition && l.Id != request.ListId))
            {
                list.Position += 1;
            }
            var draggedList = boardLists.FirstOrDefault(l => l.Id == request.ListId);
            if (draggedList == null)
            {
                return NotFound("List not found");
            }

            draggedList.Position = request.NewPosition;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Position updated successfully." });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error occurred while updating position: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to update the position.", error = ex.Message });
        }
    }
}




public class UpdateListPositionDto
{
    public Guid ListId { get; set; } // List ID to update

    public Guid BoardId { get; set; } // Board ID to which the list belongs
    public int NewPosition { get; set; } // New position of the list
}