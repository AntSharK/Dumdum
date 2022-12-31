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

        internal int amount = 1;

        public BaseUpgrade(int amount)
        {
            this.amount = amount;
        }

        public virtual void PerformUpgrade(Ball ball)
        {
            ball.Upgrades.Add(this);
        }
    }
}
