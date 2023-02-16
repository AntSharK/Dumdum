using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Speed: BaseUpgrade
    {
        public Speed(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.SPEEDUPGRADE);
        }

        public override string Description => $"Speed+{this.UpgradeAmount}";
        public override int BorderColor => UpgradeColors.BLUE;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SpeedMultiplier += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
