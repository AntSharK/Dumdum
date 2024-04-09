using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Common
{
    public class GameHub<RoomType, PlayerType> : Hub
        where RoomType : GameRoom<PlayerType>
        where PlayerType : Player
    {
        protected GameLobby<RoomType, PlayerType> GameLobby;
        protected static ILogger? Logger;

        // Defaults for client-side dispatch
        protected string Message_FreshConnection = "FreshConnection";
        protected string Message_ShowError = "ShowError";
        protected string Message_ClearState = "ClearState";

        public GameHub(GameLobby<RoomType, PlayerType> lobby)
        {
            this.GameLobby = lobby;
        }

        public static void RegisterLogger(ILogger logger)
        {
            Logger = logger;
        }

        // Adds additional behavior when connected to ping back to the client that the connection is successfully established
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync(this.Message_FreshConnection);
            await base.OnConnectedAsync();
        }

        protected async Task<(PlayerType? player, RoomType? room)> FindPlayerAndRoom(string? playerId, string roomId)
        {
            //Logger.LogInformation("FINDING ROOM:{0}", roomId);
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                Logger.LogWarning("UNABLE TO FIND ROOM ID:{0}", roomId);
                await Clients.Caller.SendAsync(this.Message_ShowError, "Room not found.");
                await Clients.Caller.SendAsync(this.Message_ClearState);
                return (null, null);
            }

            var room = this.GameLobby.Rooms[roomId];
            if (playerId == null)
            {
                //Logger.LogInformation("FOUND ROOM:{0}", roomId);
                return (null, room);
            }

            if (!room.Players.ContainsKey(playerId))
            {
                Logger.LogWarning("UNABLE TO FIND PLAYER {1} IN ROOM:{0}", roomId, playerId);
                await Clients.Caller.SendAsync(this.Message_ShowError, "Could not find player in room.");
                await Clients.Caller.SendAsync(this.Message_ClearState);
                return (null, room);
            }

            //Logger.LogWarning("FOUND PLAYER {1} IN ROOM:{0}", roomId, playerId);
            var player = room.Players[playerId];
            return (player, room);
        }
    }
}
