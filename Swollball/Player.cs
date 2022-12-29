using Swollball.Upgrades;
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
        public Score PlayerScore { get; private set; }
        public Dictionary<string, IUpgrade> CurrentUpgrades { get; private set; } = new Dictionary<string, IUpgrade>();
        public int CreditsLeft { get; set; } = 3;

        public Player(string name, string connectionId, string roomName)
        {
            this.Name = name;
            this.ConnectionId = connectionId;
            this.RoomId = roomName;
            this.PlayerScore = new Score(this.Name);
            this.Ball = new Ball(this.Name);

            UpgradeFactory.FillShop_Tier1(this.CurrentUpgrades);
        }

        public bool ApplyUpgrade(string upgradeId)
        {
            if (this.CurrentUpgrades.ContainsKey(upgradeId))
            {
                var upgradeToApply = this.CurrentUpgrades[upgradeId];
                upgradeToApply.PerformUpgrade(this.Ball);
                this.Ball.Upgrades.Add(upgradeToApply);

                // Current logic - clear the upgrade list, re-generate new ones
                this.CreditsLeft--;
                CurrentUpgrades.Clear();
                if (this.CreditsLeft > 0)
                {
                    // TODO: Fill shop correctly
                    UpgradeFactory.FillShop_Tier1(this.CurrentUpgrades);
                }

                return true;
            }

            return false;
        }

        public void StartNextRound()
        {
            // TODO: Return credits correctly and fill shop correctly
            this.CreditsLeft = 1;
            UpgradeFactory.FillShop_Tier1(this.CurrentUpgrades);
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
            public string PlayerName { get; private set; }
            public int RoundNumber { get; set; } = 0;

            public Score(string name)
            {
                this.PlayerName = name;
            }

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
