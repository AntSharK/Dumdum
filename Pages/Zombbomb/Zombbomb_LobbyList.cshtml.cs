using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Lobby = Zombbomb.ZombbombLobby;

namespace Dumdum.Pages.Zombbomb
{
    public class Zombbomb_LobbyListModel : PageModel
    {
        public List<Tuple<string, DateTime, int>> Rooms = new List<Tuple<string, DateTime, int>>();

        public void OnGet([FromServices] Lobby lobby)
        {
            Rooms = new List<Tuple<string, DateTime, int>>();
            foreach (var room in lobby.Rooms.Values)
            {
                Rooms.Add(Tuple.Create(room.RoomId, room.UpdatedTime, room.Players.Count));
            }
        }
    }
}
