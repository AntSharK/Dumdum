using Common;

namespace Swollball
{
    public class Lobby
    {
        private const int MAXROOMIDLEMINUTES = 60;
        private const int CLEANUPINTERVAL = 120000;

        public Dictionary<string, GameRoom> Rooms { get; private set; } = new Dictionary<string, GameRoom>();

        public Lobby()
        {
            _ = new Timer(this.Cleanup, null /*State*/, CLEANUPINTERVAL, CLEANUPINTERVAL);
            var rm = this.CreateRoom("TEST");
        }

        public GameRoom? CreateRoom(string connectionId)
        {
            const int ROOMIDLENGTH = 5;
            var allKeys = this.Rooms.Keys;
            var roomId = Utils.GenerateId(ROOMIDLENGTH, allKeys);

            if (roomId == null)
            {
                return null;
            }

            var newRoom = new GameRoom(roomId, connectionId);
            this.Rooms[roomId] = newRoom;
            return newRoom;
        }

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
