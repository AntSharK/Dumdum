using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Dumdum.Pages
{
    public class SwollballInsightModel : PageModel
    {
        public Swollball.GameRoom? Room;

        public void OnGet([FromServices] Swollball.Lobby lobby,
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
