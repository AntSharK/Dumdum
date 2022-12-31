using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Bulwark : BaseKeystone
    {
        public Bulwark(int value) : base(value)
        {
        }

        public override string UpgradeName => $"Bulwark+";

        public override string Description => $"Increase your damage by {this.UpgradeAmount} for every armor you gain.";

        public override void AfterUpgrade(Ball ball)
        {
            if (ball.Armor > this.preUpgradeStat)
            {
                ball.Dmg = ball.Dmg + (ball.Armor - this.preUpgradeStat) * this.UpgradeAmount;
            }
        }

        public override void BeforeUpgrade(Ball ball)
        {
            this.preUpgradeStat = ball.Armor;
        }
        public override void PerformUpgrade(Ball ball)
        {
            this.preUpgradeStat = ball.Armor;
            base.PerformUpgrade(ball);
        }
    }
}
