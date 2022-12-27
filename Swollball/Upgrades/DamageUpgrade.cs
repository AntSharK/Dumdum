using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class DamageUpgrade : IUpgrade
    {
        public string UpgradeName => $"Damage+{this.amount}";

        public string Description => $"Increases damage by {this.amount}";

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        private int amount;

        public DamageUpgrade(int amount)
        {
            this.amount = amount;
        }

        public void PerformUpgrade(Ball ball)
        {
            ball.Dmg += this.amount;
        }
    }
}
