using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public abstract class BaseUpgrade : IUpgrade
    {
        public string UpgradeName { get; set; }

        public abstract string Description { get; }

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public abstract int BorderColor { get; }

        public abstract int FillColor { get; }

        public int Cost { get; }

        public int UpgradeAmount { get; }

        public BaseUpgrade(int amount, int cost, string name)
        {
            this.UpgradeAmount = amount;
            this.Cost = cost;
            this.UpgradeName = name;
        }

        public virtual void PerformUpgrade(Player player)
        {
            player.Ball.Upgrades.Add(this);
        }
    }
}
