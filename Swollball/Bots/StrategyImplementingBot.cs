using Swollball.Upgrades;

namespace Swollball
{
    public class StrategyImplementingBot : Player
    {
        private Func<IUpgrade, int> GetUpgradeScore;
        private Func<Player, int> GetTierUpScore;

        public StrategyImplementingBot(string name, string roomName, Func<IUpgrade, int> upgradeScore, Func<Player, int> tierUpScore)
            : base(name, "TestConnectionId", roomName)
        {
            this.GetUpgradeScore = upgradeScore;
            this.GetTierUpScore = tierUpScore;

            this.BuyUpgrades();
        }

        public override void StartNextRound()
        {
            base.StartNextRound();
            BuyUpgrades();
        }

        private void BuyUpgrades()
        {
            // DO AI THINGS - Just buy random upgrades
            while (this.CurrentUpgrades.Count > 0)
            {
                var upgradeScores = this.GetUpgradeScores(this.CurrentUpgrades);
                var maxUpgradeScore = -1;
                var bestUpgrade = this.CurrentUpgrades.Values.First();
                foreach (var upgradeScore in upgradeScores)
                {
                    if (upgradeScore.Item2 > maxUpgradeScore)
                    {
                        maxUpgradeScore = upgradeScore.Item2;
                        bestUpgrade = upgradeScore.Item1;
                    }
                }

                // If it's time to tier up, do so
                var tierUpScore = GetTierUpScore(this);
                if (tierUpScore >= maxUpgradeScore
                    && this.Economy.UpgradeTierCost > 0
                    && this.Economy.UpgradeTierCost <= this.Economy.CreditsLeft)
                {
                    this.TierUp();
                    return;
                }

                // If no cards are good, refresh
                if (maxUpgradeScore < 0)
                {
                    this.RefreshShop();
                    return;
                }

                var upgradeId = bestUpgrade.ServerId;
                if (!this.ApplyUpgrade(upgradeId)) // Avoid infinite loops when unable to buy upgrades
                {
                    this.RefreshShop();
                }
            }
        }

        private IEnumerable<Tuple<IUpgrade, int>> GetUpgradeScores(Dictionary<string, IUpgrade> currentUpgrades)
        {
            foreach (var upgrade in currentUpgrades.Values)
            {
                // The blank upgrade is worth -999
                if (upgrade.UpgradeName == String.Empty)
                {
                    yield return new Tuple<IUpgrade, int>(upgrade, -999);
                }

                var upgradeScore = this.GetUpgradeScore(upgrade);
                yield return new Tuple<IUpgrade, int>(upgrade, upgradeScore);
            }
        }
    }
}
