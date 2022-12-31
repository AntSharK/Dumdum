using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class SizeUpgrade : BaseUpgrade
    {
        public SizeUpgrade(int amount) : base(amount)
        {
        }

        public override string UpgradeName => $"Grow+{this.amount}";

        public override string Description => $"Increases size by {this.amount}";

        public override void PerformUpgrade(Ball ball)
        {
            ball.SizeMultiplier += this.amount * 0.01f;
            ball.Upgrades.Add(this);
        }

    }
}
