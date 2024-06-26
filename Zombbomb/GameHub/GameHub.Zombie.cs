﻿using Common.Util;
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
                await Clients.Caller.SendAsync(this.Message_ShowError, "Room not found.");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            if (room.State != ZombbombRoom.RoomState.SettingUp)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, "Room already started.");
                return;
            }

            var allKeys = room.Players.Keys;
            var zombieId = Utils.GenerateId(10, allKeys);
            if (zombieId != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
                await SpawnZombie(room, zombieId, colorIn, isRespawnEvent: false);
            }
        }

        public async Task RespawnZombie(string roomId, string zombieId, string colorIn)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, "Room not found.");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            await SpawnZombie(room, zombieId, colorIn, isRespawnEvent: true);
        }

        private async Task SpawnZombie(ZombbombRoom room, string zombieId, string colorIn, bool isRespawnEvent)
        {
            Zombie? zombie = isRespawnEvent ? room.Players[zombieId] : room.CreatePlayer(zombieId, Context.ConnectionId);
            var color = int.Parse(colorIn.TrimStart('#'), System.Globalization.NumberStyles.HexNumber);

            if (zombie == null)
            {
                await Clients.Caller.SendAsync(this.Message_ShowError, $"Error creating zombie {zombieId}.");
                return;
            }

            // Do some color filtering
            zombie.Color = color;
            zombie.IsDead = false;

            await Clients.Client(room.ConnectionId).SendAsync("SpawnZombie", zombieId, color);
            await Clients.Client(zombie.ConnectionId).SendAsync("BeZombie", zombieId,
                room.RoomId,
                room.ZombieBounds.Left,
                room.ZombieBounds.Right,
                room.ZombieBounds.Top,
                room.ZombieBounds.Bottom,
                room.ZombieSpeed,
                room.RespawnTime,
                isRespawnEvent);
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

            zombie.KillZombie();
            await Clients.Client(zombie.ConnectionId).SendAsync("ZombieDead");
        }
    }
}
