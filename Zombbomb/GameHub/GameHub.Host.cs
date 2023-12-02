using Common.Util;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Zombbomb
{
    public partial class GameHub : Hub
    {
        public async Task CreateRoom()
        {
            hostConnectionId = Context.ConnectionId;
            await Clients.Caller.SendAsync("StartGame");
        }

        // Messy globals
        private static string hostConnectionId;
        private static Dictionary<string, Zombie> Zombies = new Dictionary<string, Zombie>();

        // TODO: Currently joining a room is global
        public async Task JoinRoom()
        {
            var allKeys = Zombies.Keys;
            var zombieId = Utils.GenerateId(10, allKeys);
            if (zombieId != null)
            {
                await SpawnZombie(zombieId);
            }
        }

        private async Task SpawnZombie(string zombieId)
        {
            var Zombie = new Zombie() { PlayerId = zombieId, ConnectionId = Context.ConnectionId };

            Zombies[zombieId] = Zombie;

            await Clients.Client(hostConnectionId).SendAsync("SpawnZombie", zombieId);
            await Clients.Caller.SendAsync("BeZombie", zombieId);
        }

        public async Task SetZombiePosition(string zombieId, double x, double y)
        {
            if (!Zombies.ContainsKey(zombieId)) { return; }

            var zombie = Zombies[zombieId];
            zombie.LocationX = x;
            zombie.LocationY = y;

            await Clients.Client(zombie.ConnectionId).SendAsync("SetPosition", x, y);
        }

        public async Task UpdateServerZombiePosition(string zombieId, double x, double y)
        {
            if (!Zombies.ContainsKey(zombieId)) { return; }

            var zombie = Zombies[zombieId];
            zombie.LocationX = x;
            zombie.LocationY = y;
            await Clients.Client(hostConnectionId).SendAsync("UpdatePosition", zombieId, x, y);
        }

        public async Task DestroyZombie(string zombieId)
        {
            if (!Zombies.ContainsKey(zombieId)) { return; }

            var zombie = Zombies[zombieId];

            Zombies.Remove(zombieId);
            await Clients.Client(zombie.ConnectionId).SendAsync("ZombieDead");
        }
    }
}
