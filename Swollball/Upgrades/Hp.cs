using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class Hp : BaseUpgrade
    {
        public Hp(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.HPUPGRADE);
        }

        public override string Description => $"HP+{this.UpgradeAmount}";
        public override int BorderColor => UpgradeColors.RED;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            player.Ball.IncreaseStat(UpgradeTags.HPUPGRADE, this.UpgradeAmount, 0 /*Depth*/);
            base.PerformUpgrade(player);
        }
    }
}
