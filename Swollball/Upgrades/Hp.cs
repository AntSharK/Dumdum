using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Hp : BaseUpgrade
    {
        public Hp(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.HPUPGRADE);
        }

        public override string Description => $"HP+{this.UpgradeAmount}";
        public override int BorderColor => UpgradeColors.RED;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Hp += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
