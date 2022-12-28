using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class ArmorUpgrade : IUpgrade
    {
        public string UpgradeName => $"ARMOR+{this.amount}";

        public string Description => $"Increases armor by {this.amount}";

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public int BorderColor { get; private set; } = 11045079;

        private int amount;

        public ArmorUpgrade(int amount)
        {
            this.amount = amount;
        }

        public void PerformUpgrade(Ball ball)
        {
            ball.Armor += this.amount;
        }
    }
}
