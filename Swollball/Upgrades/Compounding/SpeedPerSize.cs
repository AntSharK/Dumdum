namespace Swollball.Upgrades
{
    public class SpeedPerSize: BaseUpgrade
    {
        public SpeedPerSize(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Speed+{this.UpgradeAmount} for every 10 size you have.";
        public override int BorderColor => UpgradeColors.BLUE;
        public override int FillColor => UpgradeColors.LAVENDER;

        public override void PerformUpgrade(Player player)
        {
            var speedIncrease = this.UpgradeAmount * player.Ball.SizeMultiplier / 10;
            player.Ball.IncreaseStat(UpgradeTags.SPEEDUPGRADE, speedIncrease, 0);
            base.PerformUpgrade(player);
        }
    }
}
