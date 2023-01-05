using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Hp : BaseUpgrade
    {
        public Hp(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"HP+";

        public override string Description => $"Increases HP by {this.UpgradeAmount}";

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Hp += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
