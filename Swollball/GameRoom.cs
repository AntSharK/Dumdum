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
            if (tp != null)
            {
                tp.Ball.Color = 11745079;
                tp.Ball.Keystones["Giant"] = new Upgrades.Keystones.Giant(2, 0);
                tp.Ball.Keystones["Bulwark"] = new Upgrades.Keystones.Bulwark(2, 0);
                tp.Ball.Keystones["Feast"] = new Upgrades.Keystones.Feast(5, 0);
                tp.Ball.Keystones["Harden"] = new Upgrades.Keystones.Harden(4, 0);
                tp.Ball.Upgrades.Add(new Upgrades.Hp(25, 0, "TESTUPGRADE"));
                tp.Ball.SizeMultiplier = 600;
                tp.Economy.CreditsLeft = 99;
            }
            /*
            var tp2 = this.CreatePlayer("S", "YAYA");
            tp2.Ball.Color = 11045079;
            tp2.Ball.Dmg = 20;
            tp2.Ball.SpeedMultiplier = 400;
            tp2.Ball.SizeMultiplier = 400;
            var tp3 = this.CreatePlayer("LCBAT", "BARA");
            tp3.Ball.Color = 01745079;
            tp3.Ball.SizeMultiplier = 500;
            tp3.Ball.SpeedMultiplier = 500; */

            this.CreateAutomatedPlayer();
            this.CreateAutomatedPlayer();
            this.CreateAutomatedPlayer();
#endif
        }

        private static List<string> BotNames = new List<string>()
        {
            "MOOF", "LOW", "YU", "CHENG",
            "ANT", "SHARK",
            "MM", "CUI", "MU", "YING",
            "VJ", "PEM", "MA", "RAJ", "JU",
        };

        private static Random rng = new Random();

        internal Player? CreateAutomatedPlayer()
        {
            var i = rng.Next(BotNames.Count); 
            var playerName = BotNames[i] + "BOT" + (this.Players.Count() + 1);

            var newPlayer = new AutomatedPlayer(playerName, this.RoomId);

            // Assign the bot a random color
            newPlayer.Ball.Color = rng.Next(0xFFFFFF);

            if (this.Players.ContainsKey(playerName))
            {
                return null;
            }

            this.Players[playerName] = newPlayer;
            return newPlayer;
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
                player.StartNextRound();
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
