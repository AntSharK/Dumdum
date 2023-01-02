using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public abstract class BaseKeystone : IKeystone
    {
        public abstract string UpgradeName { get; }

        public abstract string Description { get; }

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public virtual int BorderColor => 11045079;

        public virtual int Cost { get; set; }

        public int UpgradeAmount { get; set;  }

        internal int preUpgradeStat;

        public BaseKeystone(int amount, int cost)
        {
            this.UpgradeAmount = amount;
            this.Cost = cost;
        }

        public abstract void AfterUpgrade(Ball ball);

        public abstract void BeforeUpgrade(Ball ball);

        public virtual void PerformUpgrade(Ball ball)
        {
            if (ball.Keystones.ContainsKey(this.UpgradeName))
            {
                ball.Keystones[this.UpgradeName].UpgradeAmount += this.UpgradeAmount;
            }
            else
            {
                ball.Keystones[this.UpgradeName] = this;
            }
        }
    }
}
