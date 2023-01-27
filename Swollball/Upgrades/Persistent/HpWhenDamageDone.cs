using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class HpWhenDamageDone : BasePersistentUpgrade
    {
        public HpWhenDamageDone(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.LIFESTEAL);
        }

        public override string Description => $"In combat, regain {this.UpgradeAmount} HP for every 10 damage dealt.";

        public override int BorderColor => 16711748; // FF0044
        public override int FillColor => 12369084; // BCBCBC

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
