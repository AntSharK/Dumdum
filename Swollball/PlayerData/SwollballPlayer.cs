using Common;
using Swollball.Upgrades;

namespace Swollball.PlayerData
{
    public class SwollballPlayer : Player
    {
        public Ball Ball { get; private set; }
        public Score PlayerScore { get; private set; }
        public Dictionary<string, IUpgrade> CurrentUpgrades { get; private set; } = new Dictionary<string, IUpgrade>();
        public EconomyData Economy { get; private set; } = new EconomyData();

        private const int CREDITINCREMENTPERROUND = 2;
        private const int MAXKEYSTONES = 6;

        public SwollballPlayer(string name, string connectionId, string roomName)
            : base(name, connectionId, roomName)
        {
            PlayerScore = new Score(Name);
            Ball = new Ball(Name);
            Ball.AddUpgrade(new CreditsWhenDamageDone(1, 5, "Payday", -1)); // Start with a free payday upgrade
#if DEBUG
            Economy.CreditsLeft = 30;
            Economy.ShopTier = 1;
#endif

            FillShop(false /*Don't replace blank cards*/);
        }

        public bool SellUpgrade(IUpgrade? upgradeToSell)
        {
            if (upgradeToSell == null)
            {
                return false;
            }

            Economy.CreditsLeft += upgradeToSell.Cost;
            Ball.RemoveUpgrade(upgradeToSell);
            if (Economy.CreditsLeft > 0)
            {
                FillShop(false /*Don't replace blank cards*/);
            }

            return true;
        }

        public bool ApplyUpgrade(string upgradeId)
        {
            if (CurrentUpgrades.ContainsKey(upgradeId))
            {
                var upgradeToApply = CurrentUpgrades[upgradeId];
                var persistentUpgrades = Ball.GetUpgradesByTag(UpgradeTags.PERSISTENT);
                if (upgradeToApply.Tags.Contains(UpgradeTags.PERSISTENT) && persistentUpgrades.Count() >= MAXKEYSTONES)
                {
                    return false; // Too many keystones - need to free up space
                }

                var enhancements = Ball.GetUpgradesByTag(UpgradeTags.ENHANCEMENT);
                foreach (var enhancement in enhancements)
                {
                    enhancement.AnotherUpgradePurchased(upgradeToApply);
                }

                upgradeToApply.PerformUpgrade(this);

                // Current logic - replace the upgrade with a blank card
                Economy.CreditsLeft -= upgradeToApply.Cost;
                CurrentUpgrades[upgradeToApply.ServerId] = BlankUpgrade.Instance.First();

                return true;
            }

            return false;
        }

        public void RefreshShop()
        {
            const int REFRESHCOST = 1;
            Economy.CreditsLeft -= REFRESHCOST;
            CurrentUpgrades.Clear();
            if (Economy.CreditsLeft > 0)
            {
                FillShop(false /*No need to replace blank cards - they're cleared*/);
            }
        }

        public bool TierUp()
        {
            if (Economy.CreditsLeft < Economy.UpgradeTierCost)
            {
                return false;
            }

            Economy.CreditsLeft -= Economy.UpgradeTierCost;
            Economy.ShopTier++;

            if (Economy.ShopTier < 0 || Economy.ShopTier > UpgradeFactory.UpgradeTierCost.Length)
            {
                return true;
            }

            Economy.UpgradeTierCost = UpgradeFactory.UpgradeTierCost[Economy.ShopTier];
            Economy.ShopSize = UpgradeFactory.ShopSize[Economy.ShopTier];
            return true;
        }

        private void FillShop(bool replaceBlankCards)
        {
            CurrentUpgrades = UpgradeFactory.FillShop(CurrentUpgrades, Economy.ShopSize, Economy.ShopTier, replaceBlankCards);
        }

        public virtual void StartNextRound()
        {
            if (Economy.CreditsLeft > 0)
            {
                Economy.CreditsLeft = 0;
            }

            var rewardUpgrades = Ball.GetUpgradesByTag(UpgradeTags.ONTURNSTART);
            foreach (var rewardUpgrade in rewardUpgrades)
            {
                rewardUpgrade.StartNextRound(this);
            }

            Economy.MaxCredits += CREDITINCREMENTPERROUND;
            Economy.CreditsLeft += Economy.MaxCredits;

            if (Economy.CreditsLeft < 0) // Special bonus - can't go below 0 credits on round start
            {
                Economy.CreditsLeft = 0;
            }

            // Remove upgrades
            var upgradesToRemove = new List<IUpgrade>();
            foreach (var upgrade in Ball.GetUpgradesByTag(UpgradeTags.TEMPORARY))
            {
                upgrade.Duration--;
                if (upgrade.Duration <= 0)
                {
                    upgradesToRemove.Add(upgrade);
                }
            }

            foreach (var upgrade in upgradesToRemove)
            {
                upgrade.RemoveUpgrade(this);
                SellUpgrade(upgrade);
            }

            FillShop(true /*Replace blank cards*/);
        }
    }
}
