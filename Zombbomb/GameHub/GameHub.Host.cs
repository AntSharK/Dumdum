using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Zombbomb
{
    public partial class GameHub : Hub
    {
        public async Task CreateRoom(string explodeTime, string zombieSpeed, string playerSpeed, string reloadTime, string respawnTime)
        {
            var newRoom = this.GameLobby.CreateRoom(Context.ConnectionId);

            if (newRoom != null)
            {
                int.TryParse(explodeTime, out newRoom.ExplodeTime);
                double.TryParse(zombieSpeed, out newRoom.ZombieSpeed);
                double.TryParse(playerSpeed, out newRoom.PlayerSpeed);
                int.TryParse(reloadTime, out newRoom.ReloadTime);
                int.TryParse(respawnTime, out newRoom.RespawnTime);

                newRoom.PlayerSpeed = newRoom.PlayerSpeed / 10d;
                newRoom.ZombieSpeed = newRoom.ZombieSpeed / 167d; // At approximately 60 fps, this should make the speeds equivalent
                Logger.LogInformation("CREATED ROOM ID {0}", newRoom.RoomId);
                await Clients.Caller.SendAsync("StartGame", 
                    newRoom.RoomId, 
                    newRoom.ExplodeTime,
                    newRoom.ZombieSpeed,
                    newRoom.PlayerSpeed,
                    newRoom.ReloadTime,
                    newRoom.RespawnTime);
            }
            else
            {
                Logger.LogWarning("FAILED TO CREATE ROOM.");
                await Clients.Caller.SendAsync("ShowError", "ERROR CREATING ROOM.");
            }
        }

        public async Task ResetHostSession(string roomId)
        {
            (_, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) { return; }

            if (room.State == ZombbombRoom.RoomState.GameOver)
            {
                room.ResetState();

                // Respawn every zombie
                await Task.WhenAll(room.Players
                    .Where(p => !p.Value.IsDead)
                    .Select(p => SpawnZombie(room, p.Key, "#" + p.Value.Color.ToString("X" /*Hexadecimal format*/), true /*isRespawnEvent*/)));
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

            room.ZombieBounds.Height = 1024;
            await Clients.Group(roomId).SendAsync("SetBounds", room.ZombieBounds.Left, room.ZombieBounds.Right, room.ZombieBounds.Top, room.ZombieBounds.Bottom);
            room.State = ZombbombRoom.RoomState.Arena;
        }

        public async Task EndRound(string roomId)
        {
            (_, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) { return; }

            room.State = ZombbombRoom.RoomState.GameOver;
        }
    }
}
