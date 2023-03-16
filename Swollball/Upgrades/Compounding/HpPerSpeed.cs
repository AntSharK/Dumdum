using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class HpPerSpeed: BaseUpgrade
    {
        public HpPerSpeed(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"HP+{this.UpgradeAmount} for every 10 speed you have.";
        public override int BorderColor => UpgradeColors.RED;
        public override int FillColor => UpgradeColors.LAVENDER;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            var hpIncrease = this.UpgradeAmount * player.Ball.SpeedMultiplier / 10;
            player.Ball.IncreaseStat(UpgradeTags.HPUPGRADE, hpIncrease, 0);
            base.PerformUpgrade(player);
        }
    }
}
