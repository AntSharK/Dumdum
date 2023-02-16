using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class ArmorPerArmor : BaseUpgrade
    {
        public ArmorPerArmor(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"Armor+{this.UpgradeAmount} for every 10 armor you have.";
        public override int BorderColor => UpgradeColors.GREEN;
        public override int FillColor => UpgradeColors.LAVENDER;

        public override void PerformUpgrade(Player player)
        {
            if (player.Ball.Armor > 0)
            {
                player.Ball.Armor = player.Ball.Armor + this.UpgradeAmount * player.Ball.Armor / 10;
            }
            base.PerformUpgrade(player);
        }

    }
}
