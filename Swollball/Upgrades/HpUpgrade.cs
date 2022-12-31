using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class HpUpgrade : IUpgrade
    {
        public string UpgradeName => $"HP+{this.amount}";

        public string Description => $"Increases HP by {this.amount}";

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public int BorderColor { get; private set; } = 11045079;

        private int amount;

        public HpUpgrade(int amount)
        {
            this.amount = amount;
        }

        public void PerformUpgrade(Ball ball)
        {
            ball.Hp += this.amount;
            ball.Upgrades.Add(this);
        }
    }
}
