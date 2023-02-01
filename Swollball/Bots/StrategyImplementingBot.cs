using Swollball.Upgrades;

namespace Swollball
{
    public class StrategyImplementingBot : Player
    {
        private Dictionary<string, int> UpgradeScores;
        private Func<Player, int> GetTierUpScore;


        public StrategyImplementingBot(string name, string roomName, Dictionary<string, int> upgradeScores, Func<Player, int> tierUpScore)
            : base(name, "TestConnectionId", roomName)
        {
            this.UpgradeScores = upgradeScores;
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

                var tierUpScore = GetTierUpScore(this);
                if (tierUpScore >= maxUpgradeScore
                    && this.Economy.UpgradeTierCost <= this.Economy.CreditsLeft)
                {
                    this.TierUp();
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
                var upgradeScore = 1;
                if (this.UpgradeScores.ContainsKey(upgrade.UpgradeName)) {
                    upgradeScore = this.UpgradeScores[upgrade.UpgradeName];
                }

                yield return new Tuple<IUpgrade, int>(upgrade, upgradeScore);
            }
        }
    }
}
