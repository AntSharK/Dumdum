using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Tech : BaseUpgrade
    {
        public Tech(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Tech+";

        public override string Description => $"Gain {this.UpgradeAmount} armor for every 10 armor you have.";

        public override void PerformUpgrade(Player player)
        {
            if (player.Ball.Armor > 0)
            {
                player.Ball.Armor = player.Ball.Armor + this.UpgradeAmount * player.Ball.Armor / 10;
            }
            base.PerformUpgrade(player);
        }

    }
}
