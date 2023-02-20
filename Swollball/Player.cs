﻿using Swollball.Upgrades;
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
        public string? PlayerEmail { get; set; }

        private const int CREDITINCREMENTPERROUND = 2;
        private const int MAXKEYSTONES = 6;

        public Player(string name, string connectionId, string roomName)
        {
            this.Name = name;
            this.ConnectionId = connectionId;
            this.RoomId = roomName;
            this.PlayerScore = new Score(this.Name);
            this.Ball = new Ball(this.Name);
            this.Ball.AddUpgrade(new CreditsWhenDamageDone(1, 5, "Payday", -1)); // Start with a free payday upgrade
#if DEBUG
            this.Economy.CreditsLeft = 30;
            this.Economy.ShopTier = 1;
#endif

            this.FillShop(false /*Don't replace blank cards*/);
        }

        public bool SellUpgrade(IUpgrade? upgradeToSell)
        {
            if (upgradeToSell == null)
            {
                return false;
            }

            this.Economy.CreditsLeft += upgradeToSell.Cost;
            this.Ball.RemoveUpgrade(upgradeToSell);
            if (this.Economy.CreditsLeft > 0)
            {
                this.FillShop(false /*Don't replace blank cards*/);
            }

            return true;
        }

        public bool ApplyUpgrade(string upgradeId)
        {
            if (this.CurrentUpgrades.ContainsKey(upgradeId))
            {
                var upgradeToApply = this.CurrentUpgrades[upgradeId];
                var persistentUpgrades = this.Ball.GetUpgradesByTag(UpgradeTags.PERSISTENT);
                if (upgradeToApply.Tags.Contains(UpgradeTags.PERSISTENT) && persistentUpgrades.Count() >= MAXKEYSTONES)
                {
                    return false; // Too many keystones - need to free up space
                }

                upgradeToApply.PerformUpgrade(this);

                // Current logic - replace the upgrade with a blank card
                this.Economy.CreditsLeft -= upgradeToApply.Cost;
                CurrentUpgrades[upgradeToApply.ServerId] = BlankUpgrade.Instance.First();

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
                this.FillShop(false /*No need to replace blank cards - they're cleared*/);
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

            if (this.Economy.ShopTier < 0 || this.Economy.ShopTier > UpgradeFactory.UpgradeTierCost.Length)
            {
                return true;
            }

            this.Economy.UpgradeTierCost = UpgradeFactory.UpgradeTierCost[this.Economy.ShopTier];
            this.Economy.ShopSize = UpgradeFactory.ShopSize[this.Economy.ShopTier];
            return true;
        }

        private void FillShop(bool replaceBlankCards)
        {
            this.CurrentUpgrades = UpgradeFactory.FillShop(this.CurrentUpgrades, this.Economy.ShopSize, this.Economy.ShopTier, replaceBlankCards);
        }

        public virtual void StartNextRound()
        {
            if (this.Economy.CreditsLeft > 0)
            {
                this.Economy.CreditsLeft = 0;
            }

            var rewardUpgrades = this.Ball.GetUpgradesByTag(UpgradeTags.ONTURNSTART);
            foreach (var rewardUpgrade in rewardUpgrades)
            {
                rewardUpgrade.StartNextRound(this);
            }

            this.Economy.MaxCredits += CREDITINCREMENTPERROUND;
            this.Economy.CreditsLeft += this.Economy.MaxCredits;

            if (this.Economy.CreditsLeft < 0) // Special bonus - can't go below 0 credits on round start
            {
                this.Economy.CreditsLeft = 0;
            }

            // Remove upgrades
            var upgradesToRemove = new List<IUpgrade>();
            foreach (var upgrade in this.Ball.GetUpgradesByTag(UpgradeTags.TEMPORARY))
            {
                upgrade.Duration--;
                if (upgrade.Duration <= 0)
                {
                    upgradesToRemove.Add(upgrade);
                }
            }

            foreach(var upgrade in upgradesToRemove)
            {
                upgrade.RemoveUpgrade(this);
                this.SellUpgrade(upgrade);
            }
            
            this.FillShop(true /*Replace blank cards*/);
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
            public int CreditsLeft { get; set; } = 9;
            public int MaxCredits { get; set; } = 9;
            public int ShopSize { get; set; } = UpgradeFactory.ShopSize[1];
            public int ShopTier { get; set; } = 1;
            public int UpgradeTierCost { get; set; } = UpgradeFactory.UpgradeTierCost[1];
        }

        public class Score
        {
            public int PointsLeft { get; set; } = 0;
            public int PointsDeducted { get; set; } = 0;
            public int RoundDamageDone { get; set; } = 0;
            public int RoundDamageReceived { get; set; } = 0;
            public string PlayerName { get; private set; }
            public int RoundNumber { get; set; } = 0;
            public int TotalDamageDone { get; set; } = 0;
            public int TotalDamageReceived { get; set; } = 0;


            public Score(string name)
            {
                this.PlayerName = name;
            }

            public void ResetRound()
            {
                this.RoundDamageReceived = 0;
                this.RoundDamageDone = 0;
            }
        }
    }
}
