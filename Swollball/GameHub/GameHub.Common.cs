using Microsoft.AspNetCore.SignalR;
using Swollball.PlayerData;

namespace Swollball
{
    public partial class GameHub : Common.GameHub<SwollballRoom, SwollballPlayer>
    {
        public GameHub(SwollballLobby lobby)
            : base(lobby)
        {
        }

        public async Task KickPlayer(string roomId, string playerId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (player == null || room == null) return;

            room.Players.Remove(player.Name);

            await Groups.RemoveFromGroupAsync(player.ConnectionId, roomId);
            await Clients.Client(room.ConnectionId).SendAsync("HostUpdateRoom", room);

            await Clients.Client(player.ConnectionId).SendAsync(this.Message_ClearState);
            await Clients.Client(player.ConnectionId).SendAsync(this.Message_ShowError, "You are no longer in the lobby.", true /*Should Reload*/);
        }
    }
}
