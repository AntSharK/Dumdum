using System.Drawing;
using Common.Util;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Octoprotecto
{
    public class GameHub : Common.GameHub<OctoprotectoRoom, Octopus>
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

        public async Task JoinRoom(string roomId, string colorIn)
        {
            Logger.LogInformation("PLAYER JOINS ROOM:{0}.", roomId);
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ErrorJoiningRoom", $"Room {roomId} not found.");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            if (room.State != OctoprotectoRoom.RoomState.SettingUp)
            {
                await Clients.Caller.SendAsync("ErrorJoiningRoom", $"Room {roomId} already started.");
                return;
            }

            var allKeys = room.Players.Keys;
            var playerId = Utils.GenerateId(10, allKeys);
            if (playerId == null)
            {
                await Clients.Caller.SendAsync("ErrorJoiningRoom", "Error generating player ID.");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await CreateNewOctopus(room, playerId, colorIn);
        }

        public async Task StartRoom(string roomId, bool soloRun)
        {
            if (soloRun
                && string.IsNullOrEmpty(roomId))
            {
                var newRoom = this.GameLobby.CreateRoom(Context.ConnectionId);
                if (newRoom == null)
                {
                    await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {roomId} cannot be started.");
                    return;
                }

                newRoom.CreatePlayer("SoloPlayer", Context.ConnectionId);
                newRoom.StartGame();
                return;
            }

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

            room.StartGame();
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

            if (playerId != null)
            {
                if (octopus == null)
                {
                    await Clients.Caller.SendAsync(this.Message_ShowError, $"Player {playerId} not found.", true /*Refresh on click*/);
                    return;
                }

                // Re-connect a player
                await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
                await Groups.RemoveFromGroupAsync(octopus.ConnectionId, roomId);
                octopus.ConnectionId = Context.ConnectionId;
                await Clients.Caller.SendAsync("InitializeNewPlayer", room.RoomId, room.OctopiMovementBounds, octopus);
                return;
            }

            // Re-connect the host room
            if (room.State != OctoprotectoRoom.RoomState.SettingUp)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {roomId} has already started. Resuming is not supported.", true /*Refresh on click*/);
                return;
            }

            room.ConnectionId = Context.ConnectionId;
            Logger.LogInformation("Reconnected to Room {0}", room.RoomId);
            await Clients.Caller.SendAsync("RoomCreated", room.RoomId);
            foreach (var roomPlayer in room.Players)
            {
                var roomOctopus = roomPlayer.Value;
                var roomPlayerId = roomPlayer.Key;
                await Clients.Caller.SendAsync("SpawnOctopus", roomOctopus);
            }
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

        public async Task HostOctopusDeath(string roomId, string playerId, int playerPoints)
        {
            (var octopus, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (octopus == null || room == null) { return; }

            octopus.Points = playerPoints;
            octopus.TotalDeaths++;
            octopus.IsActive = false;

            await Clients.Client(octopus.ConnectionId).SendAsync("OctopusDeathNotification", octopus.Points, octopus.GetRespawnCost());
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
            await Clients.Client(room.ConnectionId).SendAsync("SpawnOctopus", octopus);
            await Clients.Client(octopus.ConnectionId).SendAsync("OctopusRespawn", room.OctopiMovementBounds, octopus);
        }

        private async Task CreateNewOctopus(OctoprotectoRoom room, string playerId, string colorIn)
        {
            if (playerId == null)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Invalid ID provided.");
                return;
            }

            var octopus = room.CreatePlayer(playerId, Context.ConnectionId);

            if (octopus == null)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Unable to create player.");
                return;
            }

            // Set additional fields
            var color = int.Parse(colorIn.TrimStart('#'), System.Globalization.NumberStyles.HexNumber);
            octopus.Tint = color;
            octopus.SetRandomLocation(room.OctopiMovementBounds);

            await Clients.Caller.SendAsync("InitializeNewPlayer", room.RoomId, room.OctopiMovementBounds, octopus);
            await Clients.Client(room.ConnectionId).SendAsync("SpawnOctopus", octopus);
        }
    }
}
