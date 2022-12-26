using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    public class Player
    {
        public Ball Ball { get; private set; }
        public string Name { get; private set; }
        public string ConnectionId { get; set; }
        public string RoomId { get; private set; }
        public Score PlayerScore { get; private set; } = new Score();

        public Player(string name, string connectionId, string roomName)
        {
            this.Name = name;
            this.ConnectionId = connectionId;
            this.RoomId = roomName;
            this.Ball = new Ball(this.Name);
        }

        public override int GetHashCode()
        {
            return this.Name.GetHashCode();
        }

        public override bool Equals(object? obj)
        {
            if (obj is not Player p)
            {
                return false;
            }
            else
            {

                return p.Name == this.Name
                    && p.RoomId == this.RoomId;
            }
        }
        public class Score
        {
            public int TotalScore { get; set; } = 0;
            public int RoundScore { get; set; } = 0;
            public int RoundDamageDone { get; set; } = 0;
            public int RoundDamageReceived { get; set; } = 0;

            public void ResetRound()
            {
                this.RoundDamageReceived = 0;
                this.RoundDamageDone = 0;
                this.RoundScore = 0;
            }

            public void UpdateRound()
            {
                this.RoundScore = this.RoundScore + this.RoundDamageDone - this.RoundDamageReceived / 2;
                this.TotalScore += this.RoundScore;
            }
        }
    }
}
