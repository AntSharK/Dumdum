using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Regrowth: BaseUpgrade
    {
        public Regrowth(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Gain {this.UpgradeAmount} HP for every 10 speed you have.";
        public override int BorderColor => 2228258; // 220022
        public override int FillColor => 16711935; // FF00FF;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Hp += this.UpgradeAmount * player.Ball.SpeedMultiplier / 10;
            base.PerformUpgrade(player);
        }
    }
}
