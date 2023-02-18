using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Armor : BaseUpgrade
    {
        public Armor(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.ARMORUPGRADE);
        }

        public override string Description => $"Armor+{this.UpgradeAmount}";
        public override int BorderColor => UpgradeColors.GREEN;

        public override void PerformUpgrade(Player player)
        {
            player.Ball.Armor += this.UpgradeAmount;
            base.PerformUpgrade(player);
        }
    }
}
