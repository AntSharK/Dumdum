using Swollball.Bots;
using Swollball.Upgrades;

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
                tp.Ball.AddUpgrade(new Upgrades.SizeWhenHp(1, 0, "TestGiant", 99));
                tp.Ball.AddUpgrade(new Upgrades.DamageWhenArmor(1, 0, "TestBulwark", 99));
                tp.Ball.AddUpgrade(new Upgrades.HpWhenDamageDone(1, 0, "TestFeast", 99));
                tp.Ball.AddUpgrade(new Upgrades.ArmorWhenHit(1, 0, "TestHarden", 99));
                tp.Ball.AddUpgrade(new Upgrades.Hp(25, 0, "TESTUPGRADE"));
                tp.Ball.IncreaseStat(UpgradeTags.SIZEUPGRADE, 50, 0);
                tp.Economy.CreditsLeft = 99;
                tp.Economy.ShopTier = -1; // Test Shop
                tp.Economy.ShopSize = 6;
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
