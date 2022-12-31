using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace Swollball
{
    public partial class GameHub : Hub
    {
        public async Task CreateRoom()
        {
            var newRoom = this.GameLobby.CreateRoom(Context.ConnectionId);
            if (newRoom != null)
            {
                await Clients.Caller.SendAsync("CreateRoom_GetId", newRoom.RoomId);
            }
            else
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR CREATING ROOM.");
            }
        }

        public async Task StartRoom(string roomId, string maxRounds /*Serialization: This version of SignalR passes in everything as strings*/)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR STARTING ROOM - Cannot find Room ID.");
                return;
            }

            var roomToStart = this.GameLobby.Rooms[roomId];

            if (!int.TryParse(maxRounds, out int rounds))
            {
                rounds = 5;
            }

            roomToStart.StartGame(rounds);

            await Clients.Caller.SendAsync("UpdateLeaderboard", roomToStart.Players.Values.Select(s => s.PlayerScore));
            await Clients.Caller.SendAsync("StartGame", "Leaderboard");

            // Bulk dispatch
            await Task.WhenAll(roomToStart.Players.Values.Select(player =>
            {
                return Clients.Client(player.ConnectionId).SendAsync("UpdateBalls", new Ball[] { player.Ball });
            }));
            await Task.WhenAll(roomToStart.Players.Values.Select(player =>
            {
                return Clients.Client(player.ConnectionId).SendAsync("UpdateUpgrades", player.CurrentUpgrades.Values, player.CreditsLeft);
            }));

            await Clients.Group(roomToStart.RoomId).SendAsync("StartGame");
        }

        public async Task StartNextLobbyRound(string roomId)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR STARTING ROOM - Cannot find Room ID.");
                return;
            }

            var roomToStart = this.GameLobby.Rooms[roomId];
            roomToStart.StartNextRound();
            await Clients.Caller.SendAsync("UpdateBalls", roomToStart.Players.Values.Select(p => p.Ball));
            await Clients.Caller.SendAsync("SceneTransition", "Leaderboard", "BallArena");
        }

        public async Task FinishRound(RoundEvent[] roundEvents, string roomId)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                await Clients.Caller.SendAsync("ClearState");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            room.UpdateRoundEnd(roundEvents);

            await Clients.Caller.SendAsync("UpdateLeaderboard", room.Players.Values.Select(s => s.PlayerScore));
            await Clients.Caller.SendAsync("SceneTransition", "BallArena", "Leaderboard");

            // Termination condition - for when round hits max rounds
            if (room.RoundNumber < 0) {
                this.EndGame(room);
            }
            else
            {
                await Clients.Group(room.RoomId).SendAsync("StartNextRound");
            }
        }

        private async Task EndGame(GameRoom room)
        {
            await Clients.Caller.SendAsync("ClearState"); // For host machine, display last scoreboard and clear state

            // For all players, update score information and display their position
            await Clients.Group(room.RoomId).SendAsync("UpdateLeaderboard", room.Players.Values.Select(s => s.PlayerScore));
            await Clients.Group(room.RoomId).SendAsync("EndGame");
        }

        public async Task ResumeHostSession(string roomId)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR RESUMING ROOM.");
                await Clients.Caller.SendAsync("ClearState");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            room.ConnectionId = Context.ConnectionId;

            switch(room.State)
            {
                case GameRoom.RoomState.SettingUp:
                    await Clients.Caller.SendAsync("Reconnect_ResumeRoomSetup", room);
                    break;
                case GameRoom.RoomState.Arena:
                    await Clients.Caller.SendAsync("UpdateBalls", room.Players.Values.Select(p => p.Ball));
                    await Clients.Caller.SendAsync("StartGame", "BallArena");
                    break;
                case GameRoom.RoomState.Leaderboard:
                    await Clients.Caller.SendAsync("UpdateLeaderboard", room.Players.Values.Select(s => s.PlayerScore));
                    await Clients.Caller.SendAsync("StartGame", "Leaderboard");
                    break;
                case GameRoom.RoomState.TearingDown:
                    await Clients.Caller.SendAsync("ShowError", "ROOM HAS FINISHED.");
                    await Clients.Caller.SendAsync("ClearState");
                    break;

            }
        }
    }
}
