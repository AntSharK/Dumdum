using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Swollball;

namespace Dumdum.Pages
{
    public class SwollballInsightModel : PageModel
    {
        public GameRoom Room;

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
