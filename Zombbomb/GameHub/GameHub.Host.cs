using Common.Util;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Zombbomb
{
    public partial class GameHub : Hub
    {
        public async Task CreateRoom()
        {
            var newRoom = this.GameLobby.CreateRoom(Context.ConnectionId);
            if (newRoom != null)
            {
                Logger.LogInformation("CREATED ROOM ID {0}", newRoom.RoomId);
                await Clients.Caller.SendAsync("StartGame", newRoom.RoomId);
            }
            else
            {
                Logger.LogWarning("FAILED TO CREATE ROOM.");
                await Clients.Caller.SendAsync("ShowError", "ERROR CREATING ROOM.");
            }
        }

        public async Task SetZombiePosition(string roomId, string zombieId, double x, double y)
        {
            (var zombie, var room) = await this.FindPlayerAndRoom(zombieId, roomId);
            if (zombie == null) { return; }

            zombie.LocationX = x;
            zombie.LocationY = y;

            await Clients.Client(zombie.ConnectionId).SendAsync("SetPosition", x, y);
        }

        public async Task StartRound(string roomId)
        {
            (_, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) { return; }
            await Clients.Group(roomId).SendAsync("SetBounds", 0, 1400, 0, 1024);
            room.State = ZombbombRoom.RoomState.Arena;
        }
    }
}
