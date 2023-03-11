namespace Swollball.Upgrades
{
    public class HpWhenCreditSpent : BasePersistentUpgrade
    {
        private Player? player;

        public HpWhenCreditSpent(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.CASHUPGRADE);
            this.Tags.Add(UpgradeTags.ENHANCEMENT);
        }

        public override string Description => $"Gain {this.UpgradeAmount} HP when you spend a credit.";

        public override int BorderColor => UpgradeColors.BLACK;
        public override int FillColor => UpgradeColors.PERIWINKLE;

        public override void PerformUpgrade(Player player)
        {
            this.player = player; // Store the player
            base.PerformUpgrade(player);
        }

        public override void AnotherUpgradePurchased(IUpgrade upgrade)
        {
            base.AnotherUpgradePurchased(upgrade);
            if (this.player != null)
            {
                this.player.Ball.IncreaseStat(UpgradeTags.HPUPGRADE, upgrade.Cost, 0);
            }
        }
    }
}
