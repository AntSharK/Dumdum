namespace Swollball.Upgrades
{
    public class Size : BaseUpgrade
    {
        public Size(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.SIZEUPGRADE);
        }

        public override string Description => $"Size+{this.UpgradeAmount}";
        public override int BorderColor => UpgradeColors.PURPLE;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.IncreaseStat(UpgradeTags.SIZEUPGRADE, this.UpgradeAmount, 0 /*Depth*/);
            base.PerformUpgrade(player);
        }

    }
}
