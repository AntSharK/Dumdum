using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Swollball;

namespace Dumdum.Pages
{
    public class SwollballInsightModel : PageModel
    {
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public GameRoom Room;
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

        public void OnGet([FromServices] Lobby lobby,
            [FromQuery] string roomId)
        {
            if (roomId == null || !lobby.Rooms.ContainsKey(roomId))
            {
                return;
            }

            Room = lobby.Rooms[roomId];
        }
    }
}
