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

        internal int value = 1;

        internal int preUpgradeStat;

        public BaseKeystone(int value)
        {
            this.value = value;
        }

        public abstract void AfterUpgrade(Ball ball);

        public abstract void BeforeUpgrade(Ball ball);

        public virtual void PerformUpgrade(Ball ball)
        {
            ball.Keystones.Add(this);
        }
    }
}
