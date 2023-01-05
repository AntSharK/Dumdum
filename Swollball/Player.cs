using Swollball.Upgrades;
using Swollball.Upgrades.Keystones;
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
        public EconomyData Economy { get; private set; } = new EconomyData();

        private const int CREDITINCREMENTPERROUND = 1;

        public Player(string name, string connectionId, string roomName)
        {
            this.Name = name;
            this.ConnectionId = connectionId;
            this.RoomId = roomName;
            this.PlayerScore = new Score(this.Name);
            this.Ball = new Ball(this.Name);

            this.Ball.Keystones["Payday"] = new Payday(1, 0); // Start with a free payday upgrade
#if DEBUG
            this.Economy.CreditsLeft = 99;
            this.Economy.ShopTier = 1;
#endif

            this.FillShop();
        }

        public bool ApplyUpgrade(string upgradeId)
        {
            if (this.CurrentUpgrades.ContainsKey(upgradeId))
            {
                foreach (var keystone in this.Ball.Keystones.Values)
                {
                    keystone.BeforeUpgrade(this);
                }
                var upgradeToApply = this.CurrentUpgrades[upgradeId];
                upgradeToApply.PerformUpgrade(this);
                foreach (var keystone in this.Ball.Keystones.Values)
                {
                    keystone.AfterUpgrade(this);
                }

                // Current logic - clear the upgrade list, re-generate new ones
                this.Economy.CreditsLeft -= upgradeToApply.Cost;
                CurrentUpgrades.Clear();
                if (this.Economy.CreditsLeft > 0)
                {
                    this.FillShop();
                }

                return true;
            }

            return false;
        }

        public void RefreshShop()
        {
            const int REFRESHCOST = 1;
            this.Economy.CreditsLeft -= REFRESHCOST;
            CurrentUpgrades.Clear();
            if (this.Economy.CreditsLeft > 0)
            {
                this.FillShop();
            }
        }

        public bool TierUp()
        {
            if (this.Economy.CreditsLeft < this.Economy.UpgradeTierCost)
            {
                return false;
            }

            this.Economy.CreditsLeft -= this.Economy.UpgradeTierCost;
            this.Economy.ShopTier++;

            // Update the shop tier cards and costs
            switch (this.Economy.ShopTier)
            {
                case 0:
                    return true;
                case 1:
                    // Should not happen
                    this.Economy.UpgradeTierCost = 15;
                    this.Economy.ShopSize = 3;
                    break;
                case 2:
                    this.Economy.UpgradeTierCost = 17;
                    this.Economy.ShopSize = 4;
                    break;
                case 3:
                    this.Economy.UpgradeTierCost = 19;
                    this.Economy.ShopSize = 4;
                    break;
                case 4:
                    this.Economy.UpgradeTierCost = -1; // No more upgrades
                    this.Economy.ShopSize = 5;
                    break;
            }

            return true;
        }

        private void FillShop()
        {
            UpgradeFactory.FillShop(this.CurrentUpgrades, this.Economy.ShopSize, this.Economy.ShopTier);
        }

        public void StartNextRound()
        {
            if (this.Economy.CreditsLeft > 0)
            {
                this.Economy.CreditsLeft = 0;
            }

            foreach (var keystone in this.Ball.Keystones.Values)
            {
                keystone.StartNextRound(this);
            }

            this.Economy.MaxCredits += CREDITINCREMENTPERROUND;
            this.Economy.CreditsLeft += this.Economy.MaxCredits;
            this.FillShop();
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

        /// <summary>
        /// For the purpose of serializing costs and credits down to the client
        /// </summary>
        public class EconomyData
        {
            public int CreditsLeft { get; set; } = 10; // Give more credits at the start
            public int MaxCredits { get; set; } = 8;
            public int ShopSize { get; set; } = 3;
            public int ShopTier { get; set; } = 1;
            public int UpgradeTierCost { get; set; } = 15;
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
