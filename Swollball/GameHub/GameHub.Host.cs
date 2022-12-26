using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace Swollball
{
    public partial class GameHub : Hub
    {
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
            if (!GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR STARTING ROOM - No Room ID sent.");
                return;
            }

            var roomToStart = GameLobby.Rooms[roomId];
            if (roomToStart == null)
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR STARTING ROOM - Cannot find Room ID.");
                return;
            }

            roomToStart.StartGame();
            await Clients.Caller.SendAsync("UpdateBalls", roomToStart.Players.Values.Select(p => p.Ball));
            await Clients.Caller.SendAsync("StartGame");
            await Clients.Group(roomToStart.RoomId).SendAsync("StartGame");
        }

        public async Task FinishRound(RoundEvent[] roundEvents, string roomId)
        {
            if (!GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                await Clients.Caller.SendAsync("ClearState");
                return;
            }

            var room = GameLobby.Rooms[roomId];
            room.UpdateRoundEnd(roundEvents);
            
            // TODO: Tell client to switch view
        }

        public async Task ResumeHostSession(string roomId)
        {
            if (!GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR RESUMING ROOM.");
                await Clients.Caller.SendAsync("ClearState");
                return;
            }

            var room = GameLobby.Rooms[roomId];
            room.ConnectionId = Context.ConnectionId;

            switch(room.State)
            {
                case GameRoom.RoomState.SettingUp:
                    await Clients.Caller.SendAsync("Reconnect_ResumeRoomSetup", room);
                    break;
            }
        }
    }
}
