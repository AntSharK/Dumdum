using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Furious: BaseUpgrade
    {
        public Furious(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Furious+";

        public override string Description => $"Gain {this.UpgradeAmount} speed for every 10 size you have.";

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SpeedMultiplier += this.UpgradeAmount * player.Ball.SizeMultiplier / 10;
            base.PerformUpgrade(player);
        }
    }
}
