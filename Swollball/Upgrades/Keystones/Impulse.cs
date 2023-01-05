using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Impulse : BaseKeystone
    {
        public Impulse(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Impulse";

        public override string Description => $"Increase your damage by {this.UpgradeAmount} for every 10 speed you gain";

        public override void AfterUpgrade(Player player)
        {
            var ball = player.Ball;
            if (ball.SpeedMultiplier > this.preUpgradeStat)
            {
                ball.Dmg = ball.Dmg + (this.UpgradeAmount * (ball.SpeedMultiplier - this.preUpgradeStat)) / 10;
            }
        }

        public override void BeforeUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.SpeedMultiplier;
        }

        public override void PerformUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Hp;
            base.PerformUpgrade(player);
        }
    }
}
