using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class SizePerSize : BaseUpgrade
    {
        public SizePerSize(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Size+{this.UpgradeAmount} for every 10 size you have";
        public override int BorderColor => UpgradeColors.PURPLE;
        public override int FillColor => UpgradeColors.LAVENDER;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.SizeMultiplier += this.UpgradeAmount * player.Ball.SizeMultiplier / 10;
            base.PerformUpgrade(player);
        }

    }
}
