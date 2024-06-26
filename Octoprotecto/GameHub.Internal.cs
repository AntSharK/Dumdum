﻿using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Octoprotecto
{
    public partial class GameHub
    {
        private async Task CreateNewOctopus(OctoprotectoRoom room, string playerId, string colorIn, string playerNameIn)
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
            octopus.DisplayName = playerNameIn;

            await Clients.Caller.SendAsync("InitializeNewPlayer", room.RoomId, room.OctopiMovementBounds, octopus);
            await Clients.Client(room.ConnectionId).SendAsync("SpawnOctopus", octopus);
        }

        // Error when joining room - special message to reset the menu state
        private async Task JoinRoomError(string message)
        {
            await Clients.Caller.SendAsync("ErrorJoiningRoom", message);
        }

        private async Task ReconnectPlayer(OctoprotectoRoom room, Octopus octopus)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomId);
            await Groups.RemoveFromGroupAsync(octopus.ConnectionId, room.RoomId);
            octopus.ConnectionId = Context.ConnectionId;
            
            switch (room.State)
            {
                case OctoprotectoRoom.RoomState.Arena:
                case OctoprotectoRoom.RoomState.SettingUp:
                    if (octopus.IsActive)
                    {
                        await Clients.Caller.SendAsync("InitializeNewPlayer", room.RoomId, room.OctopiMovementBounds, octopus);
                    }
                    else
                    {
                        await Clients.Caller.SendAsync("OctopusDeathNotification", octopus.Points, octopus.GetRespawnCost(), room.RoomId, octopus.Name);
                    }
                    return;
                case OctoprotectoRoom.RoomState.Upgrading:
                    if (octopus.IsActive)
                    {
                        await Clients.Caller.SendAsync("InitializeNewPlayer", room.RoomId, room.OctopiMovementBounds, octopus);
                    }
                    else
                    {
                        await Clients.Caller.SendAsync("UpdateUpgrade", octopus, room.RoomId, octopus.Name);
                    }
                    return;
                default:
                    await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {room.RoomId} is not in a state that supports reconnecting.", true /*Refresh on click*/);
                    return;
            }
        }

        private async Task ReconnectHost(OctoprotectoRoom room)
        {
            if (room.State != OctoprotectoRoom.RoomState.SettingUp)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Room {room.RoomId} has already started. Resuming is not supported.", true /*Refresh on click*/);
                room.EndGame(); // Since reconnecting isn't possible, end the game
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

        private void RefreshUpgrades(Octopus octopus)
        {
            const int REFRESHMULTIPLIER = 2;
            if (octopus.RefreshCost <= octopus.Points)
            {
                octopus.Points = octopus.Points - octopus.RefreshCost;
                octopus.GenerateNewUpgrades();
                octopus.RefreshCost = octopus.RefreshCost * REFRESHMULTIPLIER;
            }
        }
    }
}
