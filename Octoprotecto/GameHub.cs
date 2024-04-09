using System.Drawing;
using Common;
using Common.Util;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Octoprotecto
{
    public partial class GameHub : Common.GameHub<OctoprotectoRoom, Octopus>
    {
        public GameHub(OctoprotectoLobby lobby) 
            : base(lobby)
        {
        }

        public async Task CreateRoom(Rectangle octopiMovementBounds)
        {
            var newRoom = this.GameLobby.CreateRoom(Context.ConnectionId);

            if (newRoom != null)
            {
                newRoom.OctopiMovementBounds = octopiMovementBounds;
                Logger.LogInformation("CREATED ROOM ID {0}", newRoom.RoomId);
                await Clients.Caller.SendAsync("RoomCreated", newRoom.RoomId);
            }
            else
            {
                Logger.LogWarning("FAILED TO CREATE ROOM.");
                await Clients.Caller.SendAsync(this.Message_ShowError, "ERROR CREATING ROOM.");
            }
        }

        public async Task JoinRoom(string roomId, string colorIn, string playerNameIn)
        {
            Logger.LogInformation("PLAYER JOINS ROOM:{0}. {1}.", roomId, playerNameIn);
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await this.JoinRoomError($"Room {roomId} not found.");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            if (room.State != OctoprotectoRoom.RoomState.SettingUp)
            {
                await this.JoinRoomError($"Room {roomId} already started.");
                return;
            }

            if (room.Players.Values.Any(c => c.DisplayName == playerNameIn))
            {
                await this.JoinRoomError($"Name {playerNameIn} already taken.");
                return;
            }

            var allKeys = room.Players.Keys;
            var playerId = Utils.GenerateId(10, allKeys);
            if (playerId == null)
            {
                await this.JoinRoomError("Error generating player ID.");
                return;
            }

            Logger.LogInformation("PLAYER JOINED ROOM:{0}, PLAYERID:{1}", roomId, playerId);
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await CreateNewOctopus(room, playerId, colorIn, playerNameIn);
        }

        public async Task StartRoom(string roomId)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {roomId} not found.");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            if (room.State != OctoprotectoRoom.RoomState.SettingUp)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {roomId} already started.");
                return;
            }

            Logger.LogInformation("STARTING ROOM:{0}", roomId);
            room.StartGame();
        }

        // A combination of creating a room, joining a room, and starting it
        // A lot of copy+pasted code from all the respective methods
        public async Task SolorunStart(Rectangle octopiMovementBounds)
        {
            // Create the room
            var newRoom = this.GameLobby.CreateRoom(Context.ConnectionId);
            
            // Join the room as both the host and a player
            newRoom.OctopiMovementBounds = octopiMovementBounds;
            newRoom.IsSoloRun = true;
            var playerId = Utils.GenerateId(10, Enumerable.Empty<string>());
            await Groups.AddToGroupAsync(Context.ConnectionId, Context.ConnectionId);

            var octopus = newRoom.CreatePlayer(playerId, Context.ConnectionId);
            octopus.Tint = int.Parse("00FFFF", System.Globalization.NumberStyles.HexNumber);
            octopus.SetRandomLocation(newRoom.OctopiMovementBounds);
            octopus.DisplayName = "PLAYER";

            // Start the room
            Logger.LogInformation("SOLO RUN STARTING IN ROOM:{0}, PLAYERID:{1}", newRoom.RoomId, playerId);
            await Clients.Caller.SendAsync("StartSoloRun", newRoom.RoomId, octopus);
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("ConnectionEstablished");
            await base.OnConnectedAsync();
        }

        public async Task Reconnect(string roomId, string playerId)
        {
            (var octopus, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {roomId} not found.", true /*Refresh on click*/);
                return;
            }

            if (room.IsSoloRun)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Refreshing is not supported for solo runs.", true /*Refresh on click*/);
                room.EndGame();
                return;
            }

            if (room.State == OctoprotectoRoom.RoomState.GameOver)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {roomId} has concluded.", true /*Refresh on click*/);
                return;
            }

            if (playerId != null)
            {
                if (octopus == null)
                {
                    await Clients.Caller.SendAsync(this.Message_ShowError, $"Player {playerId} not found.", true /*Refresh on click*/);
                    return;
                }

                // Re-connect a player
                await this.ReconnectPlayer(room, octopus);
                return;
            }

            // Re-connect the host room
            await this.ReconnectHost(room);
        }

        public async Task UpdateOctopusPosition(string roomId, string playerId, double x, double y)
        {
            (var octopus, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (octopus == null || room == null) { return; }

            if (!octopus.IsActive) { return; }
            octopus.DesiredX = x;
            octopus.DesiredY = y;

            await Clients.Client(room.ConnectionId).SendAsync("UpdatePosition", playerId, x, y);
        }

        public async Task HostOctopusDeath(string roomId, string playerId, int playerPoints,
            IDictionary<string, int> damagePerWeapon)
        {
            (var octopus, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (octopus == null || room == null) { return; }

            octopus.Points = playerPoints;
            octopus.TotalDeaths++;
            octopus.IsActive = false;

            // Update the weapon damage numbers
            foreach (var weapon in octopus.Weapons)
            {
                if (damagePerWeapon.ContainsKey(weapon.Name))
                {
                    weapon.DamageDealt = damagePerWeapon[weapon.Name];
                }
            }

            Logger.LogInformation("KILLED PLAYER IN ROOM:{0}, PLAYERID:{1}", roomId, playerId);
            await Clients.Client(octopus.ConnectionId).SendAsync("OctopusDeathNotification", octopus.Points, octopus.GetRespawnCost() /*Don't pass in IDs*/);
        }

        public async Task TriggerOctopusRespawn(string roomId, string playerId)
        {
            (var octopus, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (octopus == null || room == null) { return; }

            if (room.State != OctoprotectoRoom.RoomState.Arena) { return; }

            var respawnCost = octopus.GetRespawnCost();
            if (octopus.Points < respawnCost)
            {
                return;
            }

            octopus.Points = octopus.Points - respawnCost;
            octopus.IsActive = true;

            Logger.LogInformation("RESPAWNED PLAYER IN ROOM:{0}, PLAYERID:{1}", roomId, playerId);
            await Clients.Client(room.ConnectionId).SendAsync("SpawnOctopus", octopus);
            await Clients.Client(octopus.ConnectionId).SendAsync("OctopusRespawn", room.OctopiMovementBounds, octopus);
        }

        public async Task TriggerLoss(string roomId)
        {
            (_, var room) = await this.FindPlayerAndRoom(null, roomId);
            if  (room == null) { return; }

            Logger.LogInformation("GAME LOST FOR ROOM:{0}", roomId);
            await Clients.Group(room.RoomId).SendAsync("LossNotification");
            room.EndGame();
            Logger.LogInformation("ROOM ENDED:{0}", roomId);
        }

        public async Task TriggerVictory(string roomId)
        {
            (_, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) { return; }

            Logger.LogInformation("GAME WON FOR ROOM:{0}", roomId);
            await Clients.Group(room.RoomId).SendAsync("VictoryNotification");
            room.EndGame();
            Logger.LogInformation("ROOM ENDED:{0}", roomId);
        }

        public async Task FinishRound(string roomId, 
            IDictionary<string, int> pointsPerOctopus,
            IDictionary<string, int> damagePerWeapon)
        {
            Logger.LogInformation("FINISHING ROUND IN ROOM:{0}", roomId);
            (_, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {roomId} not found.");
                return;
            }

            room.FinishRound(pointsPerOctopus, damagePerWeapon);
            Logger.LogInformation("ROUND FINISHED IN ROOM:{0}", roomId);
            await Task.WhenAll(room.Players.Values.Select(s => { return Clients.Client(s.ConnectionId).SendAsync("UpdateUpgrade", s); }));
        }

        public async Task UpgradeDone(string roomId, string playerId)
        {
            (var octopus, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (octopus == null || room == null) { return; }

            if (room.State != OctoprotectoRoom.RoomState.Upgrading) { return; }

            Logger.LogInformation("FINISHED UPGRADE IN ROOM:{0} FOR PLAYER:{1}", roomId, playerId);
            octopus.IsActive = true;
            await Clients.Client(room.ConnectionId).SendAsync("SpawnOctopus", octopus);
            await Clients.Client(octopus.ConnectionId).SendAsync("OctopusRespawn", room.OctopiMovementBounds, octopus);

            // If all the octopi have respawned, trigger the next round
            // This can indeed trigger before the final octopus respawn - since it's ok for octopi to spawn in the middle of a round
            if (room.Players.Values.Count(c => !c.IsActive) <= 0)
            {
                Logger.LogInformation("STARTING NEXT ROUND FOR ROOM:{0}", roomId);
                await Clients.Client(room.ConnectionId).SendAsync("StartNextRound");
                room.StartGame();
                Logger.LogInformation("STARTED NEXT ROUND FOR ROOM:{0}", roomId);
            }
        }

        public async Task PurchaseUpgrade(string roomId, string playerId, string upgradeId)
        {
            (var octopus, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (octopus == null || room == null) { return; }

            if (room.State != OctoprotectoRoom.RoomState.Upgrading) { return; }

            // A null upgrade ID is sent to refresh upgrades
            if (upgradeId == null)
            {
                this.RefreshUpgrades(octopus);
            }
            else if (octopus.TryPurchaseBodyUpgrade(upgradeId))
            {
                octopus.GenerateNewUpgrades();
            }
            else if (octopus.TryPurchaseWeaponUpgrade(upgradeId))
            {
                octopus.GenerateNewUpgrades();
            }

            await Clients.Caller.SendAsync("UpdateUpgrade", octopus);
        }
    }
}
