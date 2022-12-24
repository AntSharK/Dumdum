using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    public class Lobby
    {
        private const int MAXROOMIDLEMINUTES = 60;
        private const int CLEANUPINTERVAL = 120000;
        private Timer cleanupTimer;

        public HashSet<GameRoom> Rooms { get; private set; } = new HashSet<GameRoom>();

        public Lobby()
        {
            this.cleanupTimer = new Timer(this.Cleanup, null /*State*/, CLEANUPINTERVAL, CLEANUPINTERVAL);
        }

        public GameRoom? CreateRoom()
        {
            const int ROOMIDLENGTH = 5;
            var allKeys = this.Rooms.Select(g => g.RoomId);
            var roomId = Utils.GenerateId(ROOMIDLENGTH, allKeys);

            if (roomId == null)
            {
                return null;
            }

            var newRoom = new GameRoom(roomId);
            this.Rooms.Add(newRoom);
            return newRoom;
        }

        /// <summary>
        /// The function to cleanup idle rooms
        /// </summary>
        /// <param name="state">The state object passed in by the timer</param>
        private void Cleanup(object state)
        {
            HashSet<GameRoom> roomsToDestroy = new HashSet<GameRoom>();
            foreach (var room in Rooms)
            {
                if ((DateTime.UtcNow - room.UpdatedTime).TotalMinutes > MAXROOMIDLEMINUTES)
                {
                    roomsToDestroy.Add(room);
                }
            }

            foreach (var room in roomsToDestroy)
            {
                this.Rooms.Remove(room);
            }
        }
    }
}
