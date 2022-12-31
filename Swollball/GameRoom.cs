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
        public string ConnectionId { get; set; }
        public int RoundNumber { get; private set; } = 1;
        public Dictionary<string, Player> Players { get; private set; } = new Dictionary<string, Player>();
        public DateTime UpdatedTime { get; private set; } = DateTime.UtcNow;
        public RoomState State { get; private set; } = RoomState.SettingUp;
        public int MaxRounds { get; private set; } = 5;

        public GameRoom(string roomId, string connectionId)
        {
            this.RoomId = roomId;
            this.ConnectionId = connectionId;
#if DEBUG
            // Insert test players
            var tp = this.CreatePlayer("TESTPLAYER", "ASDF");
            tp.Ball.Color = 11745079;
            tp.Ball.Upgrades.Add(new Upgrades.HpUpgrade(5));
            var tp2 = this.CreatePlayer("RANDARA", "YAYA");
            tp2.Ball.Color = 11045079;
            tp2.Ball.Dmg = 20;
            tp2.Ball.SpeedMultiplier = 1.5f;
            tp2.Ball.SizeMultiplier = 1.1f;
            var tp3 = this.CreatePlayer("LCBATA", "BARA");
            tp3.Ball.Color = 01745079;
#endif
        }

        public Player? CreatePlayer(string playerName, string connectionId)
        {
            var newPlayer = new Player(playerName, connectionId, this.RoomId);
            if (this.Players.ContainsKey(playerName))
            {
                return null;
            }

            this.Players[playerName] = newPlayer;
            return newPlayer;
        }

        public void StartGame(int maxRounds)
        {
            this.MaxRounds = maxRounds;
            this.State = RoomState.Leaderboard;
        }

        public void StartNextRound()
        {
            this.State = RoomState.Arena;
            this.UpdatedTime = DateTime.UtcNow;
        }

        public void UpdateRoundEnd(RoundEvent[] roundEvents)
        {
            this.RoundNumber++;
            if (this.RoundNumber > this.MaxRounds) {
                this.RoundNumber = -1;
                this.State = RoomState.TearingDown;
            }

            this.State = RoomState.Leaderboard;
            foreach (var player in this.Players.Values)
            {
                player.PlayerScore.ResetRound();
            }

            foreach (var roundEvent in roundEvents)
            {
                this.Players[roundEvent.AttackerId].PlayerScore.RoundDamageDone += roundEvent.DamageDone;
                this.Players[roundEvent.ReceiverId].PlayerScore.RoundDamageReceived += roundEvent.DamageDone;
            }

            foreach (var player in this.Players.Values)
            {
                player.PlayerScore.RoundNumber = this.RoundNumber;
                player.PlayerScore.UpdateRound();
            }
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

        public enum RoomState
        {
            SettingUp,
            Arena,
            Leaderboard,
            TearingDown,
        }
    }
}
