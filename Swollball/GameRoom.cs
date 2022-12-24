using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    public class GameRoom
    {
        public string RoomId { get; private set; }
        public HashSet<Player> Players { get; private set; } = new HashSet<Player>();
        public DateTime UpdatedTime { get; private set; } = DateTime.UtcNow;

        public GameRoom(string roomId)
        {
            this.RoomId = roomId;
        }

        public Player CreatePlayer(string playerName, int connectionId)
        {
            var newPlayer = new Player(playerName, connectionId, this.RoomId);
            Players.Add(newPlayer);
            return newPlayer;
        }

        public override int GetHashCode()
        {
            return this.RoomId.GetHashCode();
        }

        public override bool Equals(object? obj)
        {
            if (obj is not GameRoom g)
            {
                return false;
            }
            else
            {
                return g.RoomId == this.RoomId;
            }
        }
    }
}
