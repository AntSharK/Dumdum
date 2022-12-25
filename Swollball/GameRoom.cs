using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    public class GameRoom
    {
        public enum RoomState
        {
            SettingUp,
            Playing,
            TearingDown
        }

        public string RoomId { get; private set; }
        public string ConnectionId { get; set; }
        public HashSet<Player> Players { get; private set; } = new HashSet<Player>();
        public DateTime UpdatedTime { get; private set; } = DateTime.UtcNow;
        public RoomState State { get; private set; } = RoomState.SettingUp;

        public GameRoom(string roomId, string connectionId)
        {
            this.RoomId = roomId;
            this.ConnectionId = connectionId;

            // Insert test players
            var tp = this.CreatePlayer("TESTPLAYER", "ASDF");
            tp.Ball.Color = 11745079;
            var tp2 = this.CreatePlayer("RANDARA", "YAYA");
            tp2.Ball.Color = 11045079;
            tp2.Ball.Dmg = 25;
            tp2.Ball.SpeedMultiplier = 1.5f;
            tp2.Ball.SizeMultiplier = 1.1f;
        }

        public Player? CreatePlayer(string playerName, string connectionId)
        {
            var newPlayer = new Player(playerName, connectionId, this.RoomId);
            if (Players.Contains(newPlayer))
            {
                return null;
            }

            Players.Add(newPlayer);
            return newPlayer;
        }

        public void StartGame()
        {
            this.State = RoomState.Playing;
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
