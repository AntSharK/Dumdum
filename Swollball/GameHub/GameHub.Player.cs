using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Swollball.PlayerData;
using Swollball.Upgrades;

namespace Swollball
{
    public partial class GameHub : Hub
    {
        public async Task TESTSTART()
        {
#if DEBUG
            // TODO (TEST): THIS IS A TEST METHOD
            // Note that the upgradedata "variable is undefined" error in the client only shows up from this test method
            var userName = "TESTPLAYER";
            var roomId = this.GameLobby.Rooms.Keys.First();
            await this.ResumePlayerSession(userName, roomId);
            await this.StartRoom(roomId, "40" /*MaxHP*/);

            var player = this.GameLobby.Rooms[roomId].Players[userName];
            await Clients.Caller.SendAsync("UpdateUpgrades", player.CurrentUpgrades.Values, player.Economy);
#endif
        }

        public async Task JoinRoom(string userName, string roomId, string colorIn)
        {
            Logger.LogInformation("PLAYER: {1} JOINS ROOM:{0}.", roomId, userName);
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
            if (room.State != SwollballRoom.RoomState.SettingUp)
            {
                await Clients.Caller.SendAsync("ShowError", "Game has already started.");
                return;
            }

            var player = room.CreatePlayer(userName, Context.ConnectionId);
            if (player == null)
            {
                await Clients.Caller.SendAsync("ShowError", "Player could not be created. Pick another name.");
                return;
            }

            var color = int.Parse(colorIn.TrimStart('#'), System.Globalization.NumberStyles.HexNumber);
            player.Ball.Color = color;

            await Clients.Caller.SendAsync("PlayerJoinRoom", player.Name, roomId);
            await Clients.Client(room.ConnectionId).SendAsync("HostUpdateRoom", room);
            await Groups.AddToGroupAsync(player.ConnectionId, roomId);
        }

        public async Task ResumePlayerSession(string userName, string roomId)
        {
            Logger.LogInformation("PLAYER:{1} RESUMES ROOM:{0}.", roomId, userName);
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            await Groups.RemoveFromGroupAsync(player.ConnectionId, roomId);
            player.ConnectionId = Context.ConnectionId;
            await Groups.AddToGroupAsync(player.ConnectionId, roomId);

            switch (room.State)
            {
                case SwollballRoom.RoomState.SettingUp:
                    await Clients.Caller.SendAsync("Reconnect_ResumeWaiting", player.Name, room.RoomId);
                    break;
                case SwollballRoom.RoomState.Arena:
                case SwollballRoom.RoomState.Leaderboard:
                    // Updates the leaderboard, upgrades, and balls
                    var upgradesToDisplay = player.Economy.CreditsLeft >= 0 ?
                        player.CurrentUpgrades.Values : BlankUpgrade.Instance; // If the player has 0 credits, send blank upgrade data

                    await Clients.Caller.SendAsync("UpdateState", new Ball[] { player.Ball },
                        new PlayerData.Score[] { player.PlayerScore },
                        upgradesToDisplay, player.Economy,
                        "" /*No scene to start on, just start the game*/, null /*No transition*/);
                    break;
                case SwollballRoom.RoomState.TearingDown:
                    await Clients.Caller.SendAsync("ShowError", "ROOM HAS FINISHED.");
                    await Clients.Caller.SendAsync("ClearState");
                    break;
            }
        }

        public async Task ChooseUpgrade(string upgradeId, string userName, string roomId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            var upgradeApplied = player.ApplyUpgrade(upgradeId);
            if (upgradeApplied)
            {
                await Clients.Caller.SendAsync("UpdateBalls", new Ball[] { player.Ball });
                await this.UpdateUpgrades(player);
            }
            else
            {
                await Clients.Caller.SendAsync("ShowError", "You cannot have more than 6 persistent upgrades.");
            }
        }

        public async Task SellKeystone(string upgradeId, string userName, string roomId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            var upgradeToSell = player.Ball.FindUpgrade(upgradeId);
            var upgradeSold = player.SellUpgrade(upgradeToSell);
            if (upgradeSold)
            {
                await Clients.Caller.SendAsync("UpdateBalls", new Ball[] { player.Ball });
                await this.UpdateUpgrades(player);
            }
        }

        public async Task RefreshShop(string userName, string roomId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            player.RefreshShop();
            await this.UpdateUpgrades(player);
        }

        public async Task TierUp(string userName, string roomId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            if (player.TierUp()) {
                await this.UpdateUpgrades(player);
            }
        }

        private async Task UpdateUpgrades(SwollballPlayer player)
        {
            var currentUpgrades = player.CurrentUpgrades.Values;
            if (currentUpgrades.Count == 0
                || player.Economy.CreditsLeft <= 0)
            {
                await Clients.Caller.SendAsync("UpdateUpgrades", BlankUpgrade.Instance, player.Economy);
            }
            else
            {
                await Clients.Caller.SendAsync("UpdateUpgrades", currentUpgrades, player.Economy);
            }
        }

        public async Task StartNextPlayerRound(string userName, string roomId)
        {
            Logger.LogInformation("PLAYER:{0} STARTS NEXT ROUND IN ROOM:{1}.", roomId, userName);
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            // Updates the leaderboard, upgrades, and balls
            await Clients.Caller.SendAsync("UpdateState", new Ball[] { player.Ball },
                new PlayerData.Score[] { player.PlayerScore },
                player.CurrentUpgrades.Values, player.Economy,
                null /*Do not start game*/, null /*No transition*/);
        }
    }
}
