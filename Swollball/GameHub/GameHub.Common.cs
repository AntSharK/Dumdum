﻿using Microsoft.AspNetCore.SignalR;

namespace Swollball
{
    public partial class GameHub : Hub
    {
        private Lobby GameLobby;

        public GameHub(Lobby lobby)
        {
            this.GameLobby = lobby;
        }

        /// <inheritdoc />
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("FreshConnection");
            await base.OnConnectedAsync();
        }

        public async Task KickPlayer(string roomId, string playerId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(playerId, roomId);
            if (player == null || room == null) return;

            room.Players.Remove(player.Name);

            await Groups.RemoveFromGroupAsync(player.ConnectionId, roomId);
            await Clients.Client(room.ConnectionId).SendAsync("HostUpdateRoom", room);

            await Clients.Client(player.ConnectionId).SendAsync("ClearState");
            await Clients.Client(player.ConnectionId).SendAsync("ShowError", "You are no longer in the lobby.", true /*Should Reload*/);
        }

        private async Task<(Player?, GameRoom?)> FindPlayerAndRoom(string userName, string roomId)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                await Clients.Caller.SendAsync("ClearState");
                return (null, null);
            }

            var room = this.GameLobby.Rooms[roomId];
            if (userName == null)
            {
                return (null, room);
            }

            if (!room.Players.ContainsKey(userName))
            {
                await Clients.Caller.SendAsync("ShowError", "Could not find player in room.");
                await Clients.Caller.SendAsync("ClearState");
                return (null, room);
            }

            var player = room.Players[userName];
            return (player, room);
        }
    }
}
