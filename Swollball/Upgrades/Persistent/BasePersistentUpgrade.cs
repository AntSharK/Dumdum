using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    // Keystones are persistent upgrades
    public abstract class BasePersistentUpgrade : BaseUpgrade
    {
        internal int preUpgradeStat;

        public BasePersistentUpgrade(int amount, int cost, string name) :
            base(amount, cost, name)
        {
            this.Tags.Add(UpgradeTags.PERSISTENT);
        }

        public override void PerformUpgrade(Player player)
        {
            base.PerformUpgrade(player);
        }
    }
}
