using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Harden : BaseKeystone
    {
        public Harden(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Harden";

        public override string Description => $"Gain {this.UpgradeAmount} armor for the round when you get hit";

        public override void AfterUpgrade(Player player)
        {
            // Does nothing - all client-side
        }

        public override void BeforeUpgrade(Player player)
        {
            // Does nothing - all client-side
        }
    }
}
