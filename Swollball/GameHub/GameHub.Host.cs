using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
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
                Logger.LogInformation("CREATED ROOM ID {0}", newRoom.RoomId);
                await Clients.Caller.SendAsync("CreateRoom_GetId", newRoom.RoomId);
            }
            else
            {
                Logger.LogWarning("FAILED TO CREATE ROOM.");
                await Clients.Caller.SendAsync("ShowError", "ERROR CREATING ROOM.");
            }
        }

        public async Task StartRoom(string roomId, string maxRounds /*Serialization: This version of SignalR passes in everything as strings*/)
        {
            Logger.LogInformation("STARTING ROOM {0}.", roomId);
            (var player, var roomToStart) = await this.FindPlayerAndRoom(null, roomId);
            if (roomToStart == null) return;

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
                return Clients.Client(player.ConnectionId).SendAsync("UpdateLeaderboard", new Player.Score[] { player.PlayerScore });
            }));
            await Task.WhenAll(roomToStart.Players.Values.Select(player =>
            {
                return Clients.Client(player.ConnectionId).SendAsync("UpdateBalls", new Ball[] { player.Ball });
            }));
            await Task.WhenAll(roomToStart.Players.Values.Select(player =>
            {
                return Clients.Client(player.ConnectionId).SendAsync("UpdateUpgrades", player.CurrentUpgrades.Values, player.Economy);
            }));

            await Clients.Group(roomToStart.RoomId).SendAsync("StartGame");
        }

        public async Task StartNextLobbyRound(string roomId)
        {
            Logger.LogInformation("STARTING NEXT ROUND FOR ROOM:{0}.", roomId);
            (var player, var roomToStart) = await this.FindPlayerAndRoom(null, roomId);
            if (roomToStart == null) return;

            roomToStart.StartNextRound();
            await Clients.Caller.SendAsync("UpdateBalls", roomToStart.Players.Values.Select(p => p.Ball));
            await Clients.Caller.SendAsync("SceneTransition", "Leaderboard", "BallArena");
        }

        public async Task FinishRound(RoundEvent[] roundEvents, string roomId)
        {
            Logger.LogInformation("FINISHED ROUND FOR ROOM:{0}.", roomId);
            (var player, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) return;
            room.UpdateRoundEnd(roundEvents);

            await Clients.Caller.SendAsync("UpdateLeaderboard", room.Players.Values.Select(s => s.PlayerScore));
            await Clients.Caller.SendAsync("SceneTransition", "BallArena", "Leaderboard");

            // Termination condition - for when round hits max rounds
            if (room.RoundNumber < 0) {
                await this.EndGame(room);
            }
            else
            {
                await Clients.Group(room.RoomId).SendAsync("StartNextRound");
            }
        }

        private async Task EndGame(GameRoom room)
        {
            Logger.LogInformation("ENDGAME FOR ROOM:{0}.", room.RoomId);
            foreach (var player in room.Players.Values)
            {
                Logger.LogInformation("ENDGAME STATS. ROOM:{0}, PLAYER:{1}. SCORE:{2}. Ball Stats - D:{3},A:{4},Sz:{5},Sp:{6},Hp:{7}. Keystones:{8}.", player.RoomId, player.Name,
                    player.PlayerScore.TotalScore, player.Ball.Dmg, player.Ball.Armor, player.Ball.SizeMultiplier, player.Ball.SpeedMultiplier, player.Ball.Hp,
                    string.Join(';', player.Ball.KeystoneData));
            }
            await Clients.Caller.SendAsync("ClearState"); // For host machine, display last scoreboard and clear state

            // For all players, update score information and display their position
            await Clients.Group(room.RoomId).SendAsync("UpdateLeaderboard", room.Players.Values.Select(s => s.PlayerScore));
            await Clients.Group(room.RoomId).SendAsync("EndGame");
        }

        public async Task ResumeHostSession(string roomId)
        {
            Logger.LogInformation("ATTEMPTING TO RESUME ROOM {0}.", roomId);
            (var player, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) return;

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

        public async Task AddBot(string roomId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) return;

            room.CreateAutomatedPlayer();
            await Clients.Caller.SendAsync("HostUpdateRoom", room);
        }
    }
}
