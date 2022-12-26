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

        public async Task KickPlayer(string roomId, string playerId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            room.Players.Remove(player.Name);

            await Groups.RemoveFromGroupAsync(player.ConnectionId, roomId);
            await Clients.Client(room.ConnectionId).SendAsync("HostUpdateRoom", room);

            await Clients.Client(player.ConnectionId).SendAsync("ClearState");
            await Clients.Client(player.ConnectionId).SendAsync("ShowError", "You are no longer in the lobby.", true /*Should Reload*/);
        }

        private async Task<(Player?, GameRoom?)> FindPlayerAndRoom(string userName, string roomId)
        {
            var room = GameLobby.Rooms.FirstOrDefault(r => r.RoomId == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                await Clients.Caller.SendAsync("ClearState");
                return (null, null);
            }

            if (userName == null)
            {
                return (null, room);
            }

            if (!room.Players.ContainsKey(userName))
            {
                await Clients.Caller.SendAsync("ShowError", "Could not find player in room.");
                await Clients.Caller.SendAsync("ClearState");
                return (null, room);
            }

            var player = room.Players[userName];
            return (player, room);
        }
    }
}
