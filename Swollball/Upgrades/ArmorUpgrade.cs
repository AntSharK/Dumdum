using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class ArmorUpgrade : BaseUpgrade
    {
        public ArmorUpgrade(int amount) : base(amount)
        {
        }

        public override string UpgradeName => $"ARMOR+";

        public override string Description => $"Increases armor by {this.UpgradeAmount}";

        public override void PerformUpgrade(Ball ball)
        {
            ball.Armor += this.UpgradeAmount;
            base.PerformUpgrade(ball);
        }
    }
}
