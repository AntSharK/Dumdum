using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class HpWhenDamageDone : BasePersistentUpgrade
    {
        public HpWhenDamageDone(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.LIFESTEAL);
            this.Tags.Add(UpgradeTags.HPUPGRADE);
        }

        public override string Description => $"Regain {this.UpgradeAmount} HP for every 10 damage dealt.";

        public override int BorderColor => UpgradeColors.RED;
        public override int FillColor => UpgradeColors.SKYBLUE;

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
