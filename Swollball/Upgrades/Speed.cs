using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Speed: BaseUpgrade
    {
        public Speed(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"SPEED+";

        public override string Description => $"Increases speed by {this.UpgradeAmount}";

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SpeedMultiplier += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
