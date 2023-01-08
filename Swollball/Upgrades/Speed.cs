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
        }

        public override string Description => $"Speed+{this.UpgradeAmount}";
        public override int BorderColor => 2293504; // 22FF00
        public override int FillColor => 15658734; // EEEEEE;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SpeedMultiplier += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
