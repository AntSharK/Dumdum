using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public abstract class BaseUpgrade : IUpgrade
    {
        public abstract string UpgradeName { get; }

        public abstract string Description { get; }

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public virtual int BorderColor => 11045079;

        public virtual int Cost { get; set; }

        public int UpgradeAmount { get; }

        public BaseUpgrade(int amount, int cost)
        {
            this.UpgradeAmount = amount;
            this.Cost = cost;
        }

        public virtual void PerformUpgrade(Ball ball)
        {
            ball.Upgrades.Add(this);
        }
    }
}
