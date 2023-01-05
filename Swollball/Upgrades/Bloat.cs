using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Bloat : BaseUpgrade
    {
        public Bloat(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Bloat+";

        public override string Description => $"Increases size by {this.UpgradeAmount} for every 10 size you have";

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SizeMultiplier += this.UpgradeAmount * player.Ball.SizeMultiplier / 10;
            base.PerformUpgrade(player);
        }

    }
}
