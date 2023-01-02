using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Feast : BaseKeystone
    {
        public Feast(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Feast";

        public override string Description => $"Regain {this.UpgradeAmount} HP for every 10 damage dealt";

        public override int BorderColor => 16711748;

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
