using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Zombbomb;

namespace Dumdum.Pages
{
    public class ZombbombInsightModel : PageModel
    {
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public ZombbombRoom Room;
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

        public void OnGet([FromServices] ZombbombLobby lobby,
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
