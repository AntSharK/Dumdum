using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Inertia: BaseUpgrade
    {
        public Inertia(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Gain {this.UpgradeAmount} HP for every 10 size you have.";
        public override int BorderColor => 1162239; // 11BBFF
        public override int FillColor => 12434943; // BDBDFF;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Hp += this.UpgradeAmount * player.Ball.SizeMultiplier / 10;
            base.PerformUpgrade(player);
        }
    }
}
