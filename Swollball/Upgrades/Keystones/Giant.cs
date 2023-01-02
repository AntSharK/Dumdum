using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Giant : BaseKeystone
    {
        public Giant(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Giant";

        public override string Description => $"Increase your size by {this.UpgradeAmount} for every 10 hp gained.";

        public override void AfterUpgrade(Player player)
        {
            var ball = player.Ball;
            if (ball.Hp > this.preUpgradeStat)
            {
                ball.SizeMultiplier = ball.SizeMultiplier + 0.001f * this.UpgradeAmount * (ball.Hp - this.preUpgradeStat);
            }
        }

        public override void BeforeUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Hp;
        }

        public override void PerformUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Hp;
            base.PerformUpgrade(player);
        }
    }
}
