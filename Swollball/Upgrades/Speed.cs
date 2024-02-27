using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class Speed: BaseUpgrade
    {
        public Speed(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.SPEEDUPGRADE);
        }

        public override string Description => $"Speed+{this.UpgradeAmount}";
        public override int BorderColor => Colors.BLUE;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            player.Ball.IncreaseStat(UpgradeTags.SPEEDUPGRADE, this.UpgradeAmount, 0 /*Depth*/);
            base.PerformUpgrade(player);
        }
    }
}
