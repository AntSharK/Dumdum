using Common.Util;

namespace Common
{
    public abstract class GameLobby<RoomType, PlayerType> 
        where RoomType : GameRoom<PlayerType>
        where PlayerType: Player
    {
        private const int MAXROOMIDLEMINUTES = 60;
        private const int CLEANUPINTERVAL = 120000;

        public Dictionary<string, RoomType> Rooms { get; private set; } = new Dictionary<string, RoomType>();

        public GameLobby()
        {
            _ = new Timer(this.Cleanup, null /*State*/, CLEANUPINTERVAL, CLEANUPINTERVAL);
            // Code to create a new test room
            // var rm = this.CreateRoom("TEST");
        }

        public GameRoom<PlayerType>? CreateRoom(string connectionId)
        {
            const int ROOMIDLENGTH = 5;
            var allKeys = this.Rooms.Keys;
            var roomId = Utils.GenerateId(ROOMIDLENGTH, allKeys);

            if (roomId == null)
            {
                return null;
            }

            var newRoom = this.CreateRoomInternal(roomId, connectionId);
            this.Rooms[roomId] = newRoom;
            return newRoom;
        }

        protected abstract RoomType CreateRoomInternal(string roomId, string connectionId);

        /// <summary>
        /// The function to cleanup idle rooms
        /// </summary>
        /// <param name="state">The state object passed in by the timer</param>
        private void Cleanup(object? state)
        {
            HashSet<string> roomsToDestroy = new();
            foreach (var room in Rooms.Values)
            {
                if ((DateTime.UtcNow - room.UpdatedTime).TotalMinutes > MAXROOMIDLEMINUTES)
                {
                    roomsToDestroy.Add(room.RoomId);
                }
            }

            foreach (var room in roomsToDestroy)
            {
                this.Rooms.Remove(room);
            }
        }
    }
}
