using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class ArmorWhenHit : BasePersistentUpgrade
    {
        public ArmorWhenHit(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.REINFORCE);
            this.Tags.Add(UpgradeTags.ARMORUPGRADE);
        }

        public override string Description => $"Gain {this.UpgradeAmount} armor for the round when you get hit";

        public override int BorderColor => UpgradeColors.GREEN;
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
