using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Lifesteal : BaseKeystone
    {
        public Lifesteal(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Lifesteal";

        public override string Description => $"Regain {this.UpgradeAmount} HP for every 10 damage dealt";

        public override void AfterUpgrade(Ball ball)
        {
            // Does nothing - all client-side
        }

        public override void BeforeUpgrade(Ball ball)
        {
            // Does nothing - all client-side
        }
    }
}
