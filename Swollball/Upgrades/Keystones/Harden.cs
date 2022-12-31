using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Harden : BaseKeystone
    {

        public Harden(int value) : base(value)
        {
        }

        public override string UpgradeName => $"Harden";

        public override string Description => $"Gain {this.UpgradeAmount} armor for the round everytime you are hit";

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
