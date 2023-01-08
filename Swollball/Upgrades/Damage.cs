using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Damage : BaseUpgrade
    {
        public Damage(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Damage+{this.UpgradeAmount}";
        public override int BorderColor => 16716066; // FF1122
        public override int FillColor => 12303291; // BBBBBB

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Dmg += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
