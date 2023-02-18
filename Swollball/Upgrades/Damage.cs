using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Damage : BaseUpgrade
    {
        public Damage(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.DAMAGEUPGRADE);
        }

        public override string Description => $"Damage+{this.UpgradeAmount}";
        public override int BorderColor => UpgradeColors.BROWN;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Dmg += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
