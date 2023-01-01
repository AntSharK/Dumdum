using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class HpUpgrade : BaseUpgrade
    {
        public HpUpgrade(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"HP+";

        public override string Description => $"Increases HP by {this.UpgradeAmount}";

        public override void PerformUpgrade(Ball ball)
        {
            ball.Hp += this.UpgradeAmount;
            base.PerformUpgrade(ball);
        }
    }
}
