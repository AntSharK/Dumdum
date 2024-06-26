﻿using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Swollball.Bots;
using Swollball.PlayerData;

namespace Swollball
{
    public partial class GameHub
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
                await Clients.Caller.SendAsync(this.Message_ShowError, "ERROR CREATING ROOM.");
            }
        }

        public async Task StartRoom(string roomId, string startingHp /*Serialization: This version of SignalR passes in everything as strings*/)
        {
            Logger.LogInformation("STARTING ROOM {0}.", roomId);
            (var player, var roomToStart) = await this.FindPlayerAndRoom(null, roomId);
            if (roomToStart == null) return;

            if (!int.TryParse(startingHp, out int hpToStart))
            {
                hpToStart = 50;
            }

            roomToStart.StartGame(hpToStart);


            roomToStart.StartNextRound();
            await Clients.Caller.SendAsync("UpdateState", null /*No ball data*/,
                roomToStart.Players.Values.Select(s => s.PlayerScore),
                null, null /*No Upgrade Data*/,
                "Leaderboard" /*Start in Leaderboard*/, null /*No transition*/);

            // Bulk dispatch
            await Task.WhenAll(roomToStart.Players.Values.Select(player =>
            {
                return Clients.Client(player.ConnectionId).SendAsync("UpdateState", new Ball[] { player.Ball },
                    new PlayerData.Score[] { player.PlayerScore },
                    player.CurrentUpgrades.Values, player.Economy,
                    "" /*No scene to start on, just start the game*/, null /*No transition*/);
            }));
        }

        public async Task StartNextLobbyRound(string roomId)
        {
            Logger.LogInformation("STARTING NEXT ROUND FOR ROOM:{0}.", roomId);
            (var player, var roomToStart) = await this.FindPlayerAndRoom(null, roomId);
            if (roomToStart == null) return;

            roomToStart.StartNextRound();
            await Clients.Caller.SendAsync("UpdateState", roomToStart.Players.Values.Select(p => p.Ball),
                null /*No Leaderboard Data*/,
                null, null /*No Upgrade Data*/,
                "BallArena", "Leaderboard" /*Transition from Leaderboard to Ball Arena*/);
        }

        public async Task FinishRound(RoundEvent[] roundEvents, string roomId)
        {
            Logger.LogInformation("FINISHED ROUND FOR ROOM:{0}.", roomId);
            (var player, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) return;
            var newDeadPlayers = room.UpdateRoundEnd(roundEvents);

            // Send out messages for players who are dead
            await Task.WhenAll(newDeadPlayers.Select(player =>
            {
                Logger.LogInformation("PLAYER ELIMINATED. STATS. ROOM:{0}, PLAYER:{1}. ROUND:{2}. Ball Stats - D:{3},A:{4},Sz:{5},Sp:{6},Hp:{7}, TotalDealt:{8}, TotalTaken:{9}, PersistentUpgrades:{10}.", player.RoomId, player.Name,
                    player.PlayerScore.RoundNumber, player.Ball.Dmg, player.Ball.Armor, player.Ball.SizeMultiplier, player.Ball.SpeedMultiplier, player.Ball.Hp,
                    player.PlayerScore.TotalDamageDone, player.PlayerScore.TotalDamageReceived,
                    string.Join(';', player.Ball.PersistentUpgradeData));

                return Clients.Client(player.ConnectionId).SendAsync("EndGame", room.Players.Values.Select(s => s.PlayerScore).Union(room.DeadPlayers.Select(s => s.PlayerScore).Union(room.DeadPlayers.Select(s => s.PlayerScore))));
            }));

            foreach (var newDeadPlayer in newDeadPlayers)
            {
                await Groups.RemoveFromGroupAsync(newDeadPlayer.ConnectionId, room.RoomId);
            }

            // Termination condition - for when only one player is alive
            if (room.Players.Count <= 1)
            {
                // Send out messages for the only alive player
                await Task.WhenAll(room.Players.Values.Select(player =>
                {
                    return Clients.Client(player.ConnectionId).SendAsync("EndGame", room.Players.Values.Select(s => s.PlayerScore).Union(room.DeadPlayers.Select(s => s.PlayerScore).Union(room.DeadPlayers.Select(s => s.PlayerScore))));
                }));

                await this.EndGame(room);
            }
            else
            {
                await Clients.Caller.SendAsync("UpdateState", null /*No ball*/,
                    room.Players.Values.Select(s => s.PlayerScore),
                    null, null /*No Upgrade Data*/,
                    "Leaderboard", "BallArena" /*Transition from Ball Arena to Leaderboard*/);
                Logger.LogInformation("ENDGAME FOR ROOM:{0}.", room.RoomId);
                await Clients.Group(room.RoomId).SendAsync("StartNextRound");
            }
        }

        private async Task EndGame(SwollballRoom room)
        {
            room.State = SwollballRoom.RoomState.TearingDown;

            // For now, the endgame data is no different from a regular leaderboard update, except dead player data is also sent
            await Clients.Caller.SendAsync("UpdateState", null /*No ball*/,
                room.Players.Values.Select(s => s.PlayerScore).Union(room.DeadPlayers.Select(s => s.PlayerScore)),
                null, null /*No Upgrade Data*/,
                "Leaderboard", "BallArena" /*Transition from Ball Arena to Leaderboard*/);
            Logger.LogInformation("ENDGAME FOR ROOM:{0}.", room.RoomId);
            foreach (var player in room.Players.Values)
            {
                Logger.LogInformation("ENDGAME STATS. ROOM:{0}, PLAYER:{1}. ROUND:{2}. Ball Stats - D:{3},A:{4},Sz:{5},Sp:{6},Hp:{7}, TotalDealt:{8}, TotalTaken:{9}, PointsLeft:{10}, PersistentUpgrades:{11}.", player.RoomId, player.Name,
                    player.PlayerScore.RoundNumber, player.Ball.Dmg, player.Ball.Armor, player.Ball.SizeMultiplier, player.Ball.SpeedMultiplier, player.Ball.Hp,
                    player.PlayerScore.TotalDamageDone, player.PlayerScore.TotalDamageReceived, player.PlayerScore.PointsLeft,
                    string.Join(';', player.Ball.PersistentUpgradeData));
            }

            await Clients.Caller.SendAsync(this.Message_ClearState); // For host machine, display last scoreboard and clear state
            await this.UpdateRatings(room);
        }

        private async Task UpdateRatings(SwollballRoom room)
        {
            var allPlayers = room.Players.Values.Union(room.DeadPlayers);
            var playerEmails = allPlayers
                .Where(p => !string.IsNullOrWhiteSpace(p.PlayerEmail))
                .Select(p => p.PlayerEmail).Distinct();

            var emailToRatings = await UserInfoDB.GetPlayerRatings(playerEmails).ConfigureAwait(false);
            var averageRating = emailToRatings.Values.Average();
            var allPlayerList = allPlayers.ToList();
            allPlayerList.Sort((a, b) => b.PlayerScore.RoundNumber - a.PlayerScore.RoundNumber); // Sort from first place to last place

            // Do nothing if there is only 1 player (and avoid dividing by 0)
            if (allPlayerList.Count <= 1)
            {
                return;
            }

            // Start from the best to the lowest rating
            // This way, if someone has multiple accounts, they receive the rating change for the worst result
            var playerRanking = allPlayerList.Count - 1;
            foreach (var player in allPlayerList)
            {
                if (!string.IsNullOrWhiteSpace(player.PlayerEmail)
                    && emailToRatings.ContainsKey(player.PlayerEmail))
                {
                    var baseRatingChange = 200 * playerRanking / (allPlayerList.Count - 1) - 100;
                    var oldPlayerRating = emailToRatings[player.PlayerEmail];
                    var adjustedRating = (averageRating - oldPlayerRating) * 0.025; // Gain 1 less rating every 40 points above the average
                    emailToRatings[player.PlayerEmail] = (int)(baseRatingChange + adjustedRating + oldPlayerRating);
                }

                playerRanking--;
            }

            await UserInfoDB.UpdatePlayerRatings(emailToRatings);
        }

        public async Task ResumeHostSession(string roomId)
        {
            Logger.LogInformation("ATTEMPTING TO RESUME ROOM {0}.", roomId);
            (var player, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) return;

            room.ConnectionId = Context.ConnectionId;

            switch(room.State)
            {
                case SwollballRoom.RoomState.SettingUp:
                    await Clients.Caller.SendAsync("Reconnect_ResumeRoomSetup", room);
                    break;
                case SwollballRoom.RoomState.Arena:
                    await Clients.Caller.SendAsync("UpdateState", room.Players.Values.Select(p => p.Ball),
                        null, /*No Leaderboard Data*/
                        null, null /*No Leaderboard Data*/,
                        "BallArena" /*Scene to start on*/, null /*No transition*/);
                    break;
                case SwollballRoom.RoomState.Leaderboard:
                    await Clients.Caller.SendAsync("UpdateState", null /*No ball*/,
                        room.Players.Values.Select(s => s.PlayerScore),
                        null, null /*No Upgrade Data*/,
                        "Leaderboard" /*Scene to start on*/, null /*No transition*/);
                    break;
                case SwollballRoom.RoomState.TearingDown:
                    await Clients.Caller.SendAsync(this.Message_ShowError, "ROOM HAS FINISHED.");
                    await Clients.Caller.SendAsync(this.Message_ClearState);
                    break;

            }
        }

        public async Task AddBot(string roomId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(null, roomId);
            if (room == null) return;

            room.CreateAutomatedPlayer(null, null, string.Empty);
            await Clients.Caller.SendAsync("HostUpdateRoom", room);
        }
    }
}
