using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Armor : BaseUpgrade
    {
        public Armor(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"ARMOR+";

        public override string Description => $"Increases armor by {this.UpgradeAmount}";
        public override int BorderColor => 11184810;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Armor += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
