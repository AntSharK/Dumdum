using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class DamageUpgrade : BaseUpgrade
    {
        public DamageUpgrade(int amount) : base(amount)
        {
        }

        public override string UpgradeName => $"DMG+";

        public override string Description => $"Increases damage by {this.UpgradeAmount}";

        public override void PerformUpgrade(Ball ball)
        {
            ball.Dmg += this.UpgradeAmount;
            base.PerformUpgrade(ball);
        }
    }
}
