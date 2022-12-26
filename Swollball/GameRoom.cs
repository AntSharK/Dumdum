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

        public GameRoom(string roomId, string connectionId)
        {
            this.RoomId = roomId;
            this.ConnectionId = connectionId;

            // Insert test players
            var tp = this.CreatePlayer("TESTPLAYER", "ASDF");
            tp.Ball.Color = 11745079;
            var tp2 = this.CreatePlayer("RANDARA", "YAYA");
            tp2.Ball.Color = 11045079;
            tp2.Ball.Dmg = 2;
            tp2.Ball.SpeedMultiplier = 1.5f;
            tp2.Ball.SizeMultiplier = 1.1f;
            var tp3 = this.CreatePlayer("LCBATA", "BARA");
            tp3.Ball.Color = 01745079;
            var tp4 = this.CreatePlayer("ANOTHER", "PPAR");
            tp4.Ball.Color = 00745079;
            var tp5 = this.CreatePlayer("MORETHINGS", "RARW");
            tp5.Ball.Color = 10000079;
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

        public void StartGame()
        {
            this.State = RoomState.Arena;
        }

        public void StartNextRound()
        {
            this.RoundNumber++;
            this.State = RoomState.Arena;
        }

        public void UpdateRoundEnd(RoundEvent[] roundEvents)
        {
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
