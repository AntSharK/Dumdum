using Microsoft.AspNetCore.SignalR;

namespace Swollball
{
    public partial class GameHub : Hub
    {
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
                    await Clients.Caller.SendAsync("UpdateLeaderboard", room.Players.Values.Select(s => s.PlayerScore));
                    await Clients.Caller.SendAsync("UpdateBalls", room.Players.Values.Select(p => p.Ball));
                    await Clients.Caller.SendAsync("StartGame");
                    break;
                case GameRoom.RoomState.TearingDown:
                    await Clients.Caller.SendAsync("ShowError", "ROOM HAS FINISHED.");
                    await Clients.Caller.SendAsync("ClearState");
                    break;
            }
        }
    }
}
