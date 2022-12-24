using Microsoft.AspNetCore.SignalR;

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
            await Clients.Group(roomToStart.RoomId).SendAsync("StartGame");
        }

        public async Task ResumeHostSession(string roomId)
        {
            var room = GameLobby.Rooms.FirstOrDefault(r => r.RoomId == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("ShowError", "ERROR RESUMING ROOM.");
                await Clients.Caller.SendAsync("ClearState");
                return;
            }

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
