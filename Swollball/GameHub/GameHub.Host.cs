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
                await Clients.Caller.SendAsync("ShowError", "ERROR STARTING ROOM - Cannot find Room ID.");
                return;
            }

            var roomToStart = GameLobby.Rooms[roomId];
            roomToStart.StartGame();
            await Clients.Caller.SendAsync("UpdateBalls", roomToStart.Players.Values.Select(p => p.Ball));
            await Clients.Caller.SendAsync("StartGame");
            await Clients.Group(roomToStart.RoomId).SendAsync("StartGame");
        }

        public async Task StartNextRound(string roomId)
        {
            if (!GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR STARTING ROOM - Cannot find Room ID.");
                return;
            }

            var roomToStart = GameLobby.Rooms[roomId];
            roomToStart.StartNextRound();
            await Clients.Caller.SendAsync("UpdateBalls", roomToStart.Players.Values.Select(p => p.Ball));
            await Clients.Caller.SendAsync("StartNextRound");
            await Clients.Group(roomToStart.RoomId).SendAsync("StartNextRound");
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

            await Clients.Caller.SendAsync("UpdateLeaderboard", room.Players.Values.Select(s => s.PlayerScore));
            await Clients.Caller.SendAsync("DisplayLeaderboard");
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
                case GameRoom.RoomState.Arena:
                    await Clients.Caller.SendAsync("UpdateBalls", room.Players.Values.Select(p => p.Ball));
                    await Clients.Caller.SendAsync("StartGame");
                    break;
                case GameRoom.RoomState.Leaderboard:
                    // TODO: This isn't properly working yet - have to start the game with the leaderboard scene as active
                    await Clients.Caller.SendAsync("StartGame");
                    await Clients.Caller.SendAsync("UpdateLeaderboard", room.Players.Values.Select(s => s.PlayerScore));
                    break;

            }
        }
    }
}
