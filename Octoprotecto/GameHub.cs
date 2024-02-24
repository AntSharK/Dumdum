﻿using System.Drawing;
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

        public async Task JoinRoom(string roomId, string colorIn)
        {
            Logger.LogInformation("PLAYER JOINS ROOM:{0}.", roomId);
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

            var allKeys = room.Players.Keys;
            var playerId = Utils.GenerateId(10, allKeys);
            if (playerId == null)
            {
                await this.JoinRoomError("Error generating player ID.");
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
                await this.StartSoloRun(roomId);
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
            octopus.IsActive = true;

            await Clients.Client(room.ConnectionId).SendAsync("SpawnOctopus", octopus);
            await Clients.Client(octopus.ConnectionId).SendAsync("OctopusRespawn", room.OctopiMovementBounds, octopus);
        }
    }
}
