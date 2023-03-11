namespace Swollball.Upgrades
{
    internal class SpeedEnhancement : BasePersistentUpgrade
    {
        public SpeedEnhancement(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.SPEEDUPGRADE);
            this.Tags.Add(UpgradeTags.ENHANCEMENT);
        }

        public override string Description => $"Speed upgrades purchased are {this.UpgradeAmount}x better.";

        public override int BorderColor => UpgradeColors.BLUE;
        public override int FillColor => UpgradeColors.ROSE;

        public override void AnotherUpgradePurchased(IUpgrade upgrade)
        {
            base.AnotherUpgradePurchased(upgrade);
            if (upgrade.Tags.Contains(UpgradeTags.SPEEDUPGRADE))
            {
                upgrade.UpgradeAmount *= 2;
            }
        }
    }
}
