using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class HpUpgrade : BaseUpgrade
    {
        public HpUpgrade(int amount) : base(amount)
        {
        }

        public override string UpgradeName => $"HP+{this.amount}";

        public override string Description => $"Increases HP by {this.amount}";

        public override void PerformUpgrade(Ball ball)
        {
            ball.Hp += this.amount;
            base.PerformUpgrade(ball);
        }
    }
}
