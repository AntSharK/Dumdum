using Microsoft.AspNetCore.SignalR;

namespace Swollball
{
    public partial class GameHub : Hub
    {
        private static Lobby GameLobby = new Lobby();

        /// <inheritdoc />
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("FreshConnection");
            await base.OnConnectedAsync();
        }

        private async Task<(Player, GameRoom)> FindPlayer(string userName, string roomId)
        {
            var room = GameLobby.Rooms.FirstOrDefault(r => r.RoomId == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                await Clients.Caller.SendAsync("ClearState");
                return (null, null);
            }

            var player = room.Players.FirstOrDefault(p => p.Name == userName);
            if (player == null)
            {
                await Clients.Caller.SendAsync("ShowError", "Could not find player in room.");
                await Clients.Caller.SendAsync("ClearState");
                return (null, null);
            }

            return (player, room);
        }
    }
}
