using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Zombbomb
{
    public partial class GameHub : Hub
    {
        private ZombbombLobby GameLobby;
        private static ILogger? Logger;

        public static void RegisterLogger(ILogger logger)
        {
            Logger = logger;
        }

        public GameHub(ZombbombLobby lobby)
        {
            this.GameLobby = lobby;
        }

        /// <inheritdoc />
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("FreshConnection");
            await base.OnConnectedAsync();
        }

        private async Task<(Zombie?, ZombbombRoom?)> FindPlayerAndRoom(string? userName, string roomId)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                Logger.LogWarning("UNABLE TO FIND ROOM ID:{0}", roomId);
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                await Clients.Caller.SendAsync("ClearState");
                return (null, null);
            }

            var room = this.GameLobby.Rooms[roomId];
            if (userName == null)
            {
                return (null, room);
            }

            if (!room.Players.ContainsKey(userName))
            {
                Logger.LogWarning("UNABLE TO FIND PLAYER {1} IN ROOM:{0}", roomId, userName);
                await Clients.Caller.SendAsync("ShowError", "Could not find player in room.");
                await Clients.Caller.SendAsync("ClearState");
                return (null, room);
            }

            var player = room.Players[userName];
            return (player, room);
        }
    }
}
