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

        public override string UpgradeName => $"ARMOR+{this.amount}";

        public override string Description => $"Increases armor by {this.amount}";

        public override void PerformUpgrade(Ball ball)
        {
            ball.Armor += this.amount;
            base.PerformUpgrade(ball);
        }
    }
}
