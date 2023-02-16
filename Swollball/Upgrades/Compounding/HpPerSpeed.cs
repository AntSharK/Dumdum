using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class HpPerSpeed: BaseUpgrade
    {
        public HpPerSpeed(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"HP+{this.UpgradeAmount} for every 10 speed you have.";
        public override int BorderColor => UpgradeColors.RED;
        public override int FillColor => UpgradeColors.LAVENDER;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Hp += this.UpgradeAmount * player.Ball.SpeedMultiplier / 10;
            base.PerformUpgrade(player);
        }
    }
}
