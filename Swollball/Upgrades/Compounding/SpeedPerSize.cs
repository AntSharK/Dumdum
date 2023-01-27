using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class SpeedPerSize: BaseUpgrade
    {
        public SpeedPerSize(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Speed+{this.UpgradeAmount} for every 10 size you have.";
        public override int BorderColor => 2228258; // 220022
        public override int FillColor => 16711935; // FF00FF;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SpeedMultiplier += this.UpgradeAmount * player.Ball.SizeMultiplier / 10;
            base.PerformUpgrade(player);
        }
    }
}
