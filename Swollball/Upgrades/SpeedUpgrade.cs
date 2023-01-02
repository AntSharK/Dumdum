using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class SpeedUpgrade: BaseUpgrade
    {
        public SpeedUpgrade(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"SPEED+";

        public override string Description => $"Increases speed by {this.UpgradeAmount}";

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SpeedMultiplier += this.UpgradeAmount * 0.01f;
            base.PerformUpgrade(player);
        }
    }
}
