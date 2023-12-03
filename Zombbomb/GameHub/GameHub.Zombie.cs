using Common.Util;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Zombbomb
{
    public partial class GameHub
    {
        public async Task JoinRoom(string roomId, string colorIn)
        {
            Logger.LogInformation("PLAYER JOINS ROOM:{0}.", roomId);
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            var allKeys = room.Players.Keys;
            var zombieId = Utils.GenerateId(10, allKeys);
            if (zombieId != null)
            {
                await SpawnZombie(room, zombieId, colorIn);
            }
        }

        private async Task SpawnZombie(ZombbombRoom room, string zombieId, string colorIn)
        {
            var zombie = room.CreatePlayer(zombieId, Context.ConnectionId);

            var color = int.Parse(colorIn.TrimStart('#'), System.Globalization.NumberStyles.HexNumber);
            zombie.Color = color;

            await Clients.Client(room.ConnectionId).SendAsync("SpawnZombie", zombieId);
            await Clients.Caller.SendAsync("BeZombie", zombieId, room.RoomId);
        }

        public async Task UpdateServerZombiePosition(string roomId, string zombieId, double x, double y)
        {
            (var zombie, var room) = await this.FindPlayerAndRoom(zombieId, roomId);
            if (zombie == null || room == null) { return; }

            zombie.LocationX = x;
            zombie.LocationY = y;
            await Clients.Client(room.ConnectionId).SendAsync("UpdatePosition", zombieId, x, y);
        }

        public async Task DestroyZombie(string roomId, string zombieId)
        {
            (var zombie, var room) = await this.FindPlayerAndRoom(zombieId, roomId);
            if (zombie == null || room == null) { return; }

            room.Players.Remove(zombie.Name);
            await Clients.Client(zombie.ConnectionId).SendAsync("ZombieDead");
        }
    }
}
