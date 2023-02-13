using Swollball.Upgrades;
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
                tp.Ball.AddUpgrade(new Upgrades.SizeWhenHp(1, 0, "TestGiant"));
                tp.Ball.AddUpgrade(new Upgrades.DamageWhenArmor(1, 0, "TestBulwark"));
                tp.Ball.AddUpgrade(new Upgrades.HpWhenDamageDone(1, 0, "TestFeast"));
                tp.Ball.AddUpgrade(new Upgrades.ArmorWhenHit(1, 0, "TestHarden"));
                tp.Ball.AddUpgrade(new Upgrades.Hp(25, 0, "TESTUPGRADE"));
                tp.Ball.SizeMultiplier = 150;
                tp.Economy.CreditsLeft = 99;
            }

            this.CreateAutomatedPlayer(UpgradeScores.ArmorSustain, TierUpStrategy.Never, "AS0");
            this.CreateAutomatedPlayer(UpgradeScores.ArmorBulwarker, TierUpStrategy.Never, "AB0");
            this.CreateAutomatedPlayer(UpgradeScores.DamageSustain, TierUpStrategy.Never, "DS0");
            this.CreateAutomatedPlayer(UpgradeScores.Random, TierUpStrategy.Never, "RNG");
            this.CreateAutomatedPlayer(UpgradeScores.ArmorSustain, TierUpStrategy.Sometimes, "AS1");
            this.CreateAutomatedPlayer(UpgradeScores.ArmorBulwarker, TierUpStrategy.Sometimes, "AB1");
            this.CreateAutomatedPlayer(UpgradeScores.DamageSustain, TierUpStrategy.Sometimes, "DS1");
            this.CreateAutomatedPlayer(UpgradeScores.ArmorSustain, TierUpStrategy.WhenRich, "AS2");
            this.CreateAutomatedPlayer(UpgradeScores.ArmorBulwarker, TierUpStrategy.WhenRich, "AB2");
            this.CreateAutomatedPlayer(UpgradeScores.DamageSustain, TierUpStrategy.WhenRich, "DS2");
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

        internal Player? CreateAutomatedPlayer(Func<IUpgrade, int>? implementedStrat, Func<Player, int>? tierUpStrat, string postFix)
        {
            var i = rng.Next(BotNames.Count);

            if (implementedStrat == null)
            {
                var strat = rng.Next(4);
                switch (strat)
                {
                    case 0:
                        implementedStrat = UpgradeScores.ArmorBulwarker;
                        postFix += "AB";
                        break;
                    case 1:
                        implementedStrat = UpgradeScores.ArmorSustain;
                        postFix += "AS";
                        break;
                    case 2:
                        implementedStrat = UpgradeScores.DamageSustain;
                        postFix += "DS";
                        break;
                    default:
                        implementedStrat = UpgradeScores.Random;
                        postFix += "RAN";
                        break;
                }
            }

            if (tierUpStrat == null)
            {
                var tierUpPriority = rng.Next(3);
                switch (tierUpPriority)
                {
                    case 0:
                        tierUpStrat = TierUpStrategy.Never;
                        postFix += "0";
                        break;
                    case 1:
                        tierUpStrat = TierUpStrategy.Sometimes;
                        postFix += "1";
                        break;
                    case 2:
                        tierUpStrat = TierUpStrategy.Always;
                        postFix += "2";
                        break;
                    default:
                        tierUpStrat = TierUpStrategy.Never;
                        break;
                }
            }

            var playerName = BotNames[i] + (this.Players.Count() + 1) + postFix;
            var newPlayer = new StrategyImplementingBot(playerName, this.RoomId, implementedStrat, tierUpStrat);

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
            var maxPointsLost = 10 + this.RoundNumber * 4;
            foreach (var p in roundRanking)
            {
                var deductedPoints = i * maxPointsLost / (roundRanking.Count()); 
                var player = this.Players[p.Item2];
                player.PlayerScore.PointsDeducted = deductedPoints;
                player.PlayerScore.PointsLeft -= deductedPoints;
                i++;
            }

            var deadPlayers = this.Players.Values.Where(p => p.PlayerScore.PointsLeft <= 0).ToList(); // Make a copy
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
