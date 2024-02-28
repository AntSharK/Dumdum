using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class HpPerSize: BaseUpgrade
    {
        public HpPerSize(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"HP+{this.UpgradeAmount} for every 10 size you have.";
        public override int BorderColor => Colors.RED;
        public override int FillColor => Colors.LAVENDER;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            var hpIncrease = player.Ball.SizeMultiplier / 10;
            player.Ball.IncreaseStat(UpgradeTags.HPUPGRADE, hpIncrease, 0);
            base.PerformUpgrade(player);
        }
    }
}
