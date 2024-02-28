using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class SizePerSize : BaseUpgrade
    {
        public SizePerSize(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Size+{this.UpgradeAmount} for every 10 size you have";
        public override int BorderColor => Colors.PURPLE;
        public override int FillColor => Colors.LAVENDER;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            var sizeIncrease = this.UpgradeAmount * player.Ball.SizeMultiplier / 10;
            player.Ball.IncreaseStat(UpgradeTags.SIZEUPGRADE, sizeIncrease, 0);
            base.PerformUpgrade(player);
        }

    }
}
