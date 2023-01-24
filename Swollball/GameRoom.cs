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
        public List<Player> DeadPlayers { get; private set; } = new List<Player>();
        public DateTime UpdatedTime { get; private set; } = DateTime.UtcNow;
        public RoomState State { get; internal set; } = RoomState.SettingUp;
        public int StartingPoints { get; private set; } = 0;

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
                tp.Ball.SizeMultiplier = 350;
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

        public void StartGame(int startingPoints)
        {
            this.StartingPoints = startingPoints;
            foreach (var player in this.Players.Values)
            {
                player.PlayerScore.PointsLeft = startingPoints;
            }

            this.State = RoomState.Leaderboard;
        }

        public void StartNextRound()
        {
            this.State = RoomState.Arena;
            this.UpdatedTime = DateTime.UtcNow;
        }

        public IEnumerable<Player> UpdateRoundEnd(RoundEvent[] roundEvents)
        {
            this.RoundNumber++;

            this.State = RoomState.Leaderboard;
            foreach (var player in this.Players.Values)
            {
                player.PlayerScore.ResetRound();
            }

            var playerHealthLeft = new List<Tuple<double, string>>();
            foreach (var roundEvent in roundEvents)
            {
                switch (roundEvent.EventName)
                {
                    case RoundEvent.KILL:
                        playerHealthLeft.Add(Tuple.Create(roundEvent.EventNumber, roundEvent.ReceiverId));
                        break;
                    case RoundEvent.HEALTH:
                        // Assume that "alive" players died at time 99999 - that's 1000 seconds
                        if (roundEvent.EventNumber > 0) 
                        { 
                            playerHealthLeft.Add(Tuple.Create(roundEvent.EventNumber + 99999, roundEvent.AttackerId));
                        }
                        break;
                    case RoundEvent.DAMAGE:
                        this.Players[roundEvent.AttackerId].PlayerScore.RoundDamageDone += (int)roundEvent.EventNumber;
                        this.Players[roundEvent.AttackerId].PlayerScore.TotalDamageDone += (int)roundEvent.EventNumber;
                        this.Players[roundEvent.ReceiverId].PlayerScore.RoundDamageReceived += (int)roundEvent.EventNumber;
                        this.Players[roundEvent.ReceiverId].PlayerScore.TotalDamageReceived += (int)roundEvent.EventNumber;
                        break;
                    default:
                        break;
                }
            }

            // Update player HP totals - This is a ranking from highest to lowest
            var roundRanking = playerHealthLeft.OrderByDescending(x => x.Item1);
            var i = 0;
            foreach (var p in roundRanking)
            {
                // Interpolate between 0 and RoundNumber * 10
                var deductedPoints = i * ((RoundNumber-1) * 10) / (roundRanking.Count() + 1); 
                var player = this.Players[p.Item2];
                player.PlayerScore.PointsDeducted = deductedPoints;
                player.PlayerScore.PointsLeft -= deductedPoints;
                i++;
            }

            var deadPlayers = this.Players.Values.Where(p => p.PlayerScore.PointsLeft <= 0);
            foreach (var player in deadPlayers)
            {
                this.Players.Remove(player.Name);
                this.DeadPlayers.Add(player);
            }

            // Only alive players are here
            foreach (var player in this.Players.Values)
            {
                player.PlayerScore.RoundNumber = this.RoundNumber;
                player.StartNextRound();
            }

            return deadPlayers;
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
