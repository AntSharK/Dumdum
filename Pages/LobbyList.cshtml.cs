using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Dumdum
{
    public class LobbyListModel : PageModel
    {
        public List<Tuple<string, DateTime, int, int>> Rooms = new List<Tuple<string, DateTime, int, int>>();

        public void OnGet([FromServices] Swollball.Lobby lobby)
        {
            Rooms = new List<Tuple<string, DateTime, int, int>>();
            foreach (var room in lobby.Rooms.Values)
            {
                Rooms.Add(Tuple.Create(room.RoomId, room.UpdatedTime, room.Players.Count, room.RoundNumber));
            }
        }
    }
}
