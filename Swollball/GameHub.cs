﻿using Microsoft.AspNetCore.SignalR;

namespace Swollball
{
    public class GameHub : Hub
    {
        private static Lobby GameLobby = new Lobby();

        /// <inheritdoc />
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("FreshConnection");
            await base.OnConnectedAsync();
        }

        public async Task CreateRoom()
        {
            var newRoom = GameLobby.CreateRoom(Context.ConnectionId);
            if (newRoom != null)
            {
                await Clients.Caller.SendAsync("CreateRoom_GetId", newRoom.RoomId);
            }
            else
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR CREATING ROOM.");
            }
        }

        public async Task StartRoom(string roomId)
        {
            if (roomId == null)
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR STARTING ROOM - No Room ID sent.");
                return;
            }

            var roomToStart = GameLobby.Rooms.FirstOrDefault(r => r.RoomId == roomId);
            if (roomToStart == null)
            {
                roomToStart = GameLobby.Rooms.FirstOrDefault(r => r.ConnectionId == Context.ConnectionId);
            }
            if (roomToStart == null)
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR STARTING ROOM - Cannot find connection or Room ID.");
                return;
            }

            roomToStart.StartGame();
            await Clients.Caller.SendAsync("StartGame");
        }

        public async Task ResumeHostSession(string roomId)
        {
            var room = GameLobby.Rooms.FirstOrDefault(r => r.RoomId == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR RESUMING ROOM.");
                await Clients.Caller.SendAsync("ClearState");
            }
            else
            {
                room.ConnectionId = Context.ConnectionId;
                await Clients.Caller.SendAsync("Reconnect_ResumeRoom", room);
            }
        }
    }
}
