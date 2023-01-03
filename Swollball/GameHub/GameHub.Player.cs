using Microsoft.AspNetCore.SignalR;
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
            await this.StartRoom(roomId, "5" /*MaxRounds*/);

            var player = this.GameLobby.Rooms[roomId].Players[userName];
            await Clients.Caller.SendAsync("UpdateUpgrades", player.CurrentUpgrades.Values, player.Economy);
#endif
        }

        public async Task JoinRoom(string userName, string roomId, string colorIn)
        {
            if (!this.GameLobby.Rooms.ContainsKey(roomId))
            {
                await Clients.Caller.SendAsync("ShowError", "Room not found.");
                return;
            }

            var room = this.GameLobby.Rooms[roomId];
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
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            await Groups.RemoveFromGroupAsync(player.ConnectionId, roomId);
            player.ConnectionId = Context.ConnectionId;
            await Groups.AddToGroupAsync(player.ConnectionId, roomId);

            switch (room.State)
            {
                case GameRoom.RoomState.SettingUp:
                    await Clients.Caller.SendAsync("Reconnect_ResumeWaiting", player.Name, room.RoomId);
                    break;
                case GameRoom.RoomState.Arena:
                case GameRoom.RoomState.Leaderboard:
                    await Clients.Caller.SendAsync("UpdateUpgrades", player.CurrentUpgrades.Values, player.Economy);
                    await Clients.Caller.SendAsync("UpdateBalls", new Ball[] { player.Ball });
                    await Clients.Caller.SendAsync("StartGame");
                    break;
                case GameRoom.RoomState.TearingDown:
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
            }

            await this.UpdateUpgrades(player);
        }

        public async Task RefreshShop(string userName, string roomId)
        {
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            player.RefreshShop();
            await this.UpdateUpgrades(player);
        }

        private async Task UpdateUpgrades(Player player)
        {
            var currentUpgrades = player.CurrentUpgrades.Values;
            if (currentUpgrades.Count == 0)
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
            (var player, var room) = await this.FindPlayerAndRoom(userName, roomId);
            if (player == null || room == null) return;

            player.StartNextRound();
            await Clients.Caller.SendAsync("UpdateUpgrades", player.CurrentUpgrades.Values, player.Economy);
            await Clients.Caller.SendAsync("UpdateBalls", new Ball[] { player.Ball });
        }
    }
}
