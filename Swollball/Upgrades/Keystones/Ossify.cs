using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Ossify : BaseKeystone
    {
        public Ossify(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Ossify";

        public override string Description => $"Gain {this.UpgradeAmount} armor whenever you gain 10 HP.";

        public override int BorderColor => 14527197; // DDAADD
        public override int FillColor => 14483507; // DD0033

        public override void AfterUpgrade(Player player)
        {
            var ball = player.Ball;
            if (ball.Hp > this.preUpgradeStat)
            {
                ball.Armor = ball.Armor + (this.UpgradeAmount * (ball.Hp - this.preUpgradeStat)) / 10;
            }
        }

        public override void BeforeUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Hp;
        }
        public override void PerformUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Hp;
            base.PerformUpgrade(player);
        }
    }
}
