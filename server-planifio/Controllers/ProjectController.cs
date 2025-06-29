using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Utilities;


[Route("boards")]
public class BoardsController : ControllerBase
{
    private readonly PlanifioDbContext _context;

    public BoardsController(PlanifioDbContext context)
    {
        _context = context;
    }


    [HttpPost("lists/create")]
    [Authorize]
    public async Task<JsonResult> CreateList([FromBody] Lists lists)
    {
        try
        {
            int position = await GetLastPositionWithinBoard(lists.BoardId);
            lists.Position = position;
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
        catch (Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }

    }




    [HttpPost("create")]
    [Authorize]
    public async Task<JsonResult> Createboard([FromBody] Board board)
    {
        if (board == null || string.IsNullOrEmpty(board.Name))
        {
            return new JsonResult(new { status = "error", message = "Invalid board data" });
        }
        board.UserEmail = User.FindFirst(ClaimTypes.Email).Value;
        if (board.UserEmail == null)
        {
            return new JsonResult(new { status = "error", message = "User email not found" });
        }
        Console.WriteLine(board.Id);
        _context.Boards.Add(board);
        await _context.SaveChangesAsync();

        return new JsonResult(new { status = "success", message = "board created successfully", boardId = board.Id });
    }
    [HttpGet("get")]
    [Authorize]
    //getFiles Too
    public async Task<JsonResult> GetBoards()
    {
        var userEmail = HttpContext.User?.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            HttpContext.Response.StatusCode = 401;
            return new JsonResult(new { status = "error", message = "User email not found" });
        }
        var boards = await _context.Boards
            .Where(b => b.UserEmail == userEmail)
            .Select(b => new
            {
                b.Id,
                b.Name,
                Lists = b.Lists
                    .OrderBy(l => l.Position)
                    .Select(l => new
                    {
                        l.Id,
                        l.Title,
                        Cards = l.Cards
                            .OrderBy(c => c.Position)
                            .Select(c => new
                            {
                                c.Id,
                                c.Title,
                                c.Description,
                                c.DueTime,
                                Files = c.Files.Select(f => new {f.Id, f.Name, f.FileType }).ToList()
                            }).ToList()
                    }).ToList()
            })
            .ToListAsync();

        return new JsonResult(new { status = "success", boards, email = userEmail });
    }
    public async Task<int> GetLastPositionWithinBoard(Guid boardId)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

        var isOwner = await _context.Boards.AnyAsync(b => b.Id == boardId && b.UserEmail == userEmail);

        var board = await _context.Boards
            .Include(b => b.Lists)
            .FirstOrDefaultAsync(b => b.Id == boardId);
        if (board == null)
        {
            throw new Exception("Board not found.");
        }

        if (board.Lists.Count == 0)
        {
            return 0;
        }
        var lastPosition = board.Lists.Max(l => l.Position) + 1;

        return lastPosition;
    }

    [HttpPost("list/validate-drag")]
    [Authorize]
    public async Task<JsonResult> UpdateListPositionAsync([FromBody] UpdateListPositionDto updateListPositionDto)
    {
        var listId = updateListPositionDto.ListId;
        var boardId = updateListPositionDto.BoardId;
        var newPosition = updateListPositionDto.NewPosition;

        if (listId == Guid.Empty || boardId == Guid.Empty || newPosition < 0)
        {
            return new JsonResult(new { status = "error", message = "Invalid input data" });
        }
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        var isOwner = await _context.Boards.AnyAsync(b => b.Id == boardId && b.UserEmail == userEmail);
        if (!isOwner)
        {
            return new JsonResult(new { status = "error", message = "You are not authorized to update this list position" });
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



    [HttpPost("cards/create")]
    [Authorize]
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
            card.Description = "";
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

    [HttpPost("cards/move")]
    [Authorize]
    public async Task<JsonResult> MoveCard([FromBody] MoveCardDto dto)
    {
        try
        {
            if (dto.BoardId == Guid.Empty || dto.SourceListId == Guid.Empty || dto.DestinationListId == Guid.Empty)
            {
                return new JsonResult(new { status = "error", message = "Invalid input data" });
            }
            //check is owner of board
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var isOwner = await _context.Boards.AnyAsync(b => b.Id == dto.BoardId && b.UserEmail == userEmail);
            if (!isOwner)
            {
                return new JsonResult(new { status = "error", message = "You are not authorized to move cards on this board" });
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

    [HttpPost("edit/card/description")]
    [Authorize]
    public async Task<JsonResult> EditCardDescription([FromBody] Card card)
    {
        try
        {
            if (card == null || card.Id == Guid.Empty || string.IsNullOrEmpty(card.Description))
            {
                return new JsonResult(new { status = "error", message = "Invalid card data" });
            }
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var isOwner = await _context.Cards.AnyAsync(c => c.Id == card.Id && c.List.Board.UserEmail == userEmail);
            if (!isOwner)
            {
                return new JsonResult(new { status = "error", message = "You are not authorized to edit this card" });
            }


            var existingCard = await _context.Cards.FindAsync(card.Id);
            if (existingCard == null)
            {
                return new JsonResult(new { status = "error", message = "Card not found" });
            }

            existingCard.Description = card.Description;
            await _context.SaveChangesAsync();

            return new JsonResult(new { status = "success", message = "Card description updated successfully" });
        }
        catch (Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }

    }

    [HttpPost("edit/card/due-date")]
    [Authorize]
    public async Task<JsonResult> EditCardDueDate([FromBody] Card card)
    {
        try
        {
            if (card == null || card.Id == Guid.Empty || card.DueTime == null)
            {
                return new JsonResult(new { status = "error", message = "Invalid card data" });
            }
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var isOwner = await _context.Cards.AnyAsync(c => c.Id == card.Id && c.List.Board.UserEmail == userEmail);
            if (!isOwner)
            {
                return new JsonResult(new { status = "error", message = "You are not authorized to edit this card" });
            }


            var existingCard = await _context.Cards.FindAsync(card.Id);
            if (existingCard == null)
            {
                return new JsonResult(new { status = "error", message = "Card not found" });
            }

            existingCard.DueTime = card.DueTime;
            await _context.SaveChangesAsync();

            return new JsonResult(new { status = "success", message = "Card due date updated successfully" });
        }
        catch (Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }
    }

    [HttpPost("delete/card")]
    [Authorize]
    public async Task<JsonResult> DeleteCard([FromBody] Card card)
    {
        try
        {
            if (card == null || card.Id == Guid.Empty)
            {
                return new JsonResult(new { status = "error", message = "Invalid card data" });
            }
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var isOwner = await _context.Cards.AnyAsync(c => c.Id == card.Id && c.List.Board.UserEmail == userEmail);
            if (!isOwner)
            {
                return new JsonResult(new { status = "error", message = "You are not authorized to edit this card" });
            }


            var existingCard = await _context.Cards.FindAsync(card.Id);
            if (existingCard == null)
            {
                return new JsonResult(new { status = "error", message = "Card not found" });
            }

            var deletedCardPosition = existingCard.Position;
            var listId = existingCard.ListId;
            // Check if the card has files and delete them
            var filesToDelete = await _context.Files
                .Where(f => f.CardId == existingCard.Id)
                .ToListAsync();
            if (filesToDelete.Any())
            {
                // Remove files from the database
                _context.Files.RemoveRange(filesToDelete);

                // Delete physical files from the server
                foreach (var file in filesToDelete)
                {
                    var filePath = Path.Combine("files", file.Name);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
            }
            // Remove the card's files from the database
            _context.Files.RemoveRange(filesToDelete);

            // Remove the card
            _context.Cards.Remove(existingCard);

            // Shift down positions of cards after the deleted card
            var cardsToUpdate = await _context.Cards
                .Where(c => c.ListId == listId && c.Position > deletedCardPosition)
                .ToListAsync();

            foreach (var c in cardsToUpdate)
            {
                c.Position -= 1;
            }

            await _context.SaveChangesAsync();

            return new JsonResult(new { status = "success", message = "Card deleted successfully" });
        }
        catch (Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }
    }


    //delete list remove its cards

    [HttpPost("list/delete")]
    [Authorize]
    public async Task<JsonResult> DeleteList([FromBody] Lists lists)
    {
        try
        {
            if (lists == null || lists.Id == Guid.Empty)
            {
                return new JsonResult(new { status = "error", message = "Invalid list data" });
            }
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var isOwner = await _context.Lists.AnyAsync(l => l.Id == lists.Id && l.Board.UserEmail == userEmail);
            if (!isOwner)
            {
                return new JsonResult(new { status = "error", message = "You are not authorized to delete this list" });
            }

            var existingList = await _context.Lists
                .Include(l => l.Cards)
                .FirstOrDefaultAsync(l => l.Id == lists.Id);

            if (existingList == null)
            {
                return new JsonResult(new { status = "error", message = "List not found" });
            }

            var deletedListPosition = existingList.Position;
            var boardId = existingList.BoardId; // Assumes Lists has BoardId FK

            // Remove the list and its cards
            _context.Cards.RemoveRange(existingList.Cards);
            _context.Lists.Remove(existingList);

            // Shift positions of lists after the deleted one
            var listsToUpdate = await _context.Lists
                .Where(l => l.BoardId == boardId && l.Position > deletedListPosition)
                .ToListAsync();

            foreach (var l in listsToUpdate)
            {
                l.Position -= 1;
            }

            await _context.SaveChangesAsync();

            return new JsonResult(new { status = "success", message = "List and its cards deleted successfully" });
        }
        catch (Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }
    }
    //delete board remove its lists and cards   

    [HttpPost("delete")]
    [Authorize]
    public async Task<JsonResult> DeleteBoard([FromBody] Board board)
    {
        try
        {
            if (board == null || board.Id == Guid.Empty)
            {
                return new JsonResult(new { status = "error", message = "Invalid board data" });
            }
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var isOwner = await _context.Boards.AnyAsync(b => b.Id == board.Id && b.UserEmail == userEmail);
            if (!isOwner)
            {
                return new JsonResult(new { status = "error", message = "You are not authorized to delete this board" });
            }

            var existingBoard = await _context.Boards
                .Include(b => b.Lists)
                    .ThenInclude(l => l.Cards)
                .FirstOrDefaultAsync(b => b.Id == board.Id);

            if (existingBoard == null)
            {
                return new JsonResult(new { status = "error", message = "Board not found" });
            }

            // Remove all lists and their cards
            _context.Cards.RemoveRange(existingBoard.Lists.SelectMany(l => l.Cards));
            _context.Lists.RemoveRange(existingBoard.Lists);
            _context.Boards.Remove(existingBoard);

            await _context.SaveChangesAsync();

            return new JsonResult(new { status = "success", message = "Board and its lists and cards deleted successfully" });
        }
        catch (Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }
    }
    [HttpGet("file/{filename}")]
    [Authorize]
    public IActionResult GetImage(string filename)
    {
        if (string.IsNullOrEmpty(filename) || filename.Contains(".."))
            return BadRequest("Invalid filename");
        var imagePath = Path.Combine("files", filename);

        // Check if the file exists
        if (!System.IO.File.Exists(imagePath))
            return NotFound();

        // Guess content type (optional, for image/jpeg etc.)
        var contentType = "application/octet-stream";
        new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider()
            .TryGetContentType(filename, out contentType);

        // Return the image file
        var fileBytes = System.IO.File.ReadAllBytes(imagePath);
        return File(fileBytes, contentType);
    }


    [HttpPost("file/upload")]
    [Authorize]
    public async Task<JsonResult> UploadFile([FromForm] IFormFile file, [FromForm] Guid cardId)
    {
        try
        {
            if (file == null || file.Length == 0 || cardId == Guid.Empty)
            {
                return new JsonResult(new { status = "error", message = "Invalid file or card ID" });
            }

            if (!isOwnerOfCard(cardId))
            {
                return new JsonResult(new { status = "error", message = "You are not authorized to upload files to this card" });
            }

            var uploadsFolder = Path.Combine("files");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }
            Guid id= Guid.NewGuid();
            var fileName = $"{id}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var newFile = new Files
            {
                Id = id,
                Name = fileName,
                FileType = file.ContentType,
                CardId = cardId
            };

            _context.Files.Add(newFile);
            await _context.SaveChangesAsync();

            return new JsonResult(new { status = "success", message = "File uploaded successfully", newFile=new { Id=id ,Name = fileName,
                FileType = file.ContentType } });
        }
        catch (Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }
    }
    //delete file from file id
    [HttpPost("file/delete")]
    [Authorize]
    public async Task<JsonResult> DeleteFile([FromBody] Files file)
    {
        try
        {
            if (file == null || file.Id == Guid.Empty)
            {
                return new JsonResult(new { status = "error", message = "Invalid file data" });
            }

            if (!isOwnerOfFile(file.Id))
            {
                return new JsonResult(new { status = "error", message = "You are not authorized to delete this file" });
            }

            var existingFile = await _context.Files.FindAsync(file.Id);
            if (existingFile == null)
            {
                return new JsonResult(new { status = "error", message = "File not found" });
            }

            // Remove the file from the database
            _context.Files.Remove(existingFile);

            // Delete the physical file
            var filePath = Path.Combine("files", existingFile.Name);
            if (System.IO.File.Exists(filePath))
            {
                Console.WriteLine($"Deleting file: {filePath}");
                System.IO.File.Delete(filePath);
            }

            await _context.SaveChangesAsync();

            return new JsonResult(new { status = "success", message = "File deleted successfully" });
        }
        catch (Exception ex)
        {
            return new JsonResult(new { status = "error", message = ex.Message });
        }
    }

    private bool isOwnerOfBoard(Guid boardId)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        return _context.Boards.Any(b => b.Id == boardId && b.UserEmail == userEmail);
    }
    private bool isOwnerOfList(Guid listId)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        return _context.Lists.Any(l => l.Id == listId && l.Board.UserEmail == userEmail);
    }
    private bool isOwnerOfCard(Guid cardId)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        return _context.Cards.Any(c => c.Id == cardId && c.List.Board.UserEmail == userEmail);
    }

    private bool isOwnerOfFile(Guid fileId)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        return _context.Files.Any(f => f.Id == fileId && f.Card.List.Board.UserEmail == userEmail);
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

