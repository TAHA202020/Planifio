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
    [HttpGet("get")]
public async Task<JsonResult> GetBoards()
{
    var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
    if (string.IsNullOrEmpty(userEmail))
    {
        return new JsonResult(new { status = "error", message = "User email not found" });
    }

    var boards = await _context.Boards
        .Where(b => b.UserEmail == userEmail)
        .Select(b => new {
            b.Id,
            b.Name,
            Lists = b.Lists
                .OrderBy(l => l.Position)
                .Select(l => new {
                    l.Id,
                    l.Title,
                    Cards = l.Cards
                        .OrderBy(c => c.Position)
                        .Select(c => new {
                            c.Id,
                            c.Title,
                            c.Description
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
    [HttpPost("list/validate-drag")]
public async Task<JsonResult> UpdateListPositionAsync([FromBody] UpdateListPositionDto updateListPositionDto)
{
    var listId = updateListPositionDto.ListId;
    var boardId = updateListPositionDto.BoardId;
    var newPosition = updateListPositionDto.NewPosition;

    if (listId == Guid.Empty || boardId == Guid.Empty || newPosition < 0)
    {
        return new JsonResult(new { status = "error", message = "Invalid input data" }); 
    }

    var board = await _context.Boards
        .Include(b => b.Lists)
        .FirstOrDefaultAsync(b => b.Id == boardId);

    if (board == null) return new JsonResult(new { status = "error", message = "Board not found" });
    var listToUpdate = board.Lists.FirstOrDefault(l => l.Id == listId);
    if (listToUpdate == null) return new JsonResult(new { status = "error", message = "List not found" });
    if (newPosition < 0 || newPosition >= board.Lists.Count) return new JsonResult(new { status = "error", message = "Invalid new position" });
    var sortedLists = board.Lists.OrderBy(l => l.Position).ToList();
    if (newPosition < listToUpdate.Position)
    {
        foreach (var list in sortedLists.Where(l => l.Position >= newPosition && l.Position < listToUpdate.Position))
        {
            list.Position++;
        }
    }
    else if (newPosition > listToUpdate.Position)
    {
        foreach (var list in sortedLists.Where(l => l.Position <= newPosition && l.Position > listToUpdate.Position))
        {
            list.Position--;
        }
    }
    listToUpdate.Position = newPosition;
    using (var transaction = await _context.Database.BeginTransactionAsync())
    {
        try
        {
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return new JsonResult(new { status = "success", message = "List position updated successfully" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new JsonResult(new { status = "error", message = $"Error: {ex.Message}" });
        }
    }
}


[Authorize]
[HttpPost("cards/create")]
public async Task<JsonResult> CreateCard([FromBody] Card card)
{
    try
    {
        
        // Validate input
        if (card == null || string.IsNullOrEmpty(card.Title) || card.ListId == Guid.Empty)
        {
            return new JsonResult(new { status = "error", message = "Invalid card data" });
        }
        
        // Find the List
        var list = await _context.Lists
            .Include(l => l.Cards)
            .FirstOrDefaultAsync(l => l.Id == card.ListId);

        if (list == null)
        {
            return new JsonResult(new { status = "error", message = "List not found" });
        }
        
        // Set new card details
        card.Position = list.Cards.Count > 0 ? list.Cards.Max(c => c.Position) + 1 : 0;
        card.Description="";
        // Add to database
        _context.Cards.Add(card);
        
        await _context.SaveChangesAsync();
        return new JsonResult(new
        {
            status = "success",
            card = new
            {
                card.Id,
                card.Title,
                card.Position,
                card.ListId
            }
        });
    }
    catch (Exception ex)
    {
        return new JsonResult(new { status = "error", message = ex.Message });
    }
}
[Authorize]
[HttpPost("cards/move")]
public async Task<JsonResult> MoveCard([FromBody] MoveCardDto dto)
{
    try
    {
        if (dto.BoardId == Guid.Empty || dto.SourceListId == Guid.Empty || dto.DestinationListId == Guid.Empty)
        {
            return new JsonResult(new { status = "error", message = "Invalid input data" });
        }

        var board = await _context.Boards
            .Include(b => b.Lists)
                .ThenInclude(l => l.Cards)
            .FirstOrDefaultAsync(b => b.Id == dto.BoardId);

        if (board == null)
        {
            return new JsonResult(new { status = "error", message = "Board not found" });
        }

        var sourceList = board.Lists.FirstOrDefault(l => l.Id == dto.SourceListId);
        var destinationList = board.Lists.FirstOrDefault(l => l.Id == dto.DestinationListId);

        if (sourceList == null || destinationList == null)
        {
            return new JsonResult(new { status = "error", message = "Source or destination list not found" });
        }

        if (dto.SourceIndex < 0 || dto.SourceIndex >= sourceList.Cards.Count)
        {
            return new JsonResult(new { status = "error", message = "Invalid source index" });
        }

        var cardToMove = sourceList.Cards.OrderBy(c => c.Position).ToList()[dto.SourceIndex];

        // Remove from source
        sourceList.Cards.Remove(cardToMove);

        // Insert into destination
        var destinationCardsOrdered = destinationList.Cards.OrderBy(c => c.Position).ToList();
        if (dto.DestinationIndex < 0) dto.DestinationIndex = 0;
        if (dto.DestinationIndex > destinationCardsOrdered.Count) dto.DestinationIndex = destinationCardsOrdered.Count;
        destinationCardsOrdered.Insert(dto.DestinationIndex, cardToMove);

        // Update list IDs
        cardToMove.ListId = destinationList.Id;

        // Reassign positions cleanly
        for (int i = 0; i < destinationCardsOrdered.Count; i++)
        {
            destinationCardsOrdered[i].Position = i;
        }

        if (sourceList.Id == destinationList.Id)
        {
            // If same list, update source positions too (destinationCardsOrdered already includes the change)
            sourceList.Cards = destinationCardsOrdered;
        }
        else
        {
            // If different lists, update source list separately
            var newSourceCardsOrdered = sourceList.Cards.OrderBy(c => c.Position).ToList();
            for (int i = 0; i < newSourceCardsOrdered.Count; i++)
            {
                newSourceCardsOrdered[i].Position = i;
            }
            sourceList.Cards = newSourceCardsOrdered;
            destinationList.Cards = destinationCardsOrdered;
        }

        await _context.SaveChangesAsync();

        return new JsonResult(new { status = "success", message = "Card moved successfully" });
    }
    catch (Exception ex)
    {
        return new JsonResult(new { status = "error", message = $"Error moving card: {ex.Message}" });
    }
}

}

public class UpdateListPositionDto
{
    public Guid ListId { get; set; } // List ID to update

    public Guid BoardId { get; set; } // Board ID to which the list belongs
    public int NewPosition { get; set; } // New position of the list
}
public class MoveCardDto
{
    public Guid BoardId { get; set; }
    public Guid SourceListId { get; set; }
    public Guid DestinationListId { get; set; }
    public int SourceIndex { get; set; }
    public int DestinationIndex { get; set; }
}
