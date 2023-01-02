using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Bulwark : BaseKeystone
    {
        public Bulwark(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Bulwark";

        public override string Description => $"Increase your damage by {this.UpgradeAmount} for every armor you gain.";

        public override void AfterUpgrade(Player player)
        {
            var ball = player.Ball;
            if (ball.Armor > this.preUpgradeStat)
            {
                ball.Dmg = ball.Dmg + (ball.Armor - this.preUpgradeStat) * this.UpgradeAmount;
            }
        }

        public override void BeforeUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Armor;
        }
        public override void PerformUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Armor;
            base.PerformUpgrade(player);
        }
    }
}
