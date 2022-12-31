using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class SpeedUpgrade: BaseUpgrade
    {
        public SpeedUpgrade(int amount) : base(amount)
        {
        }

        public override string UpgradeName => $"SPEED+{this.amount}";

        public override string Description => $"Increases speed by {this.amount}";

        public override void PerformUpgrade(Ball ball)
        {
            ball.SpeedMultiplier += this.amount * 0.01f;
            base.PerformUpgrade(ball);
        }
    }
}
