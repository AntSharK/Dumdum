using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Size : BaseUpgrade
    {
        public Size(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Grow+";

        public override string Description => $"Increases size by {this.UpgradeAmount}";
        public override int BorderColor => 8959; // 0022FF
        public override int FillColor => 13421772; // CCCCCC

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SizeMultiplier += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }

    }
}
