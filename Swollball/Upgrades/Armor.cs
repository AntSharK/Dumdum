using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Armor : BaseUpgrade
    {
        public Armor(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Increases armor by {this.UpgradeAmount}";
        public override int BorderColor => 11184810; // AAAAAA
        public override int FillColor => 15724527; // EFEFEF

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Armor += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
