using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Giant : BaseKeystone
    {

        public Giant(int value) : base(value)
        {
        }

        public override string UpgradeName => $"Giant+";

        public override string Description => $"Increase your size by {this.UpgradeAmount} for every 10 hp gained.";

        public override void AfterUpgrade(Ball ball)
        {
            if (ball.Hp > this.preUpgradeStat)
            {
                ball.SizeMultiplier = ball.SizeMultiplier + 0.001f * this.UpgradeAmount * (ball.Hp - this.preUpgradeStat);
            }
        }

        public override void BeforeUpgrade(Ball ball)
        {
            this.preUpgradeStat = ball.Hp;
        }

        public override void PerformUpgrade(Ball ball)
        {
            this.preUpgradeStat = ball.Hp;
            base.PerformUpgrade(ball);
        }
    }
}
