using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class DamageWhenSpeed : BasePersistentUpgrade
    {
        public DamageWhenSpeed(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.UPGRADEMODIFIER);
        }

        public override string Description => $"Damage+{this.UpgradeAmount} for every 10 speed gained";

        public override int BorderColor => 10092288; // 99FF00
        public override int FillColor => 11250603; // ABABAB

        public override void AfterUpgrade(Player player)
        {
            var ball = player.Ball;
            if (ball.SpeedMultiplier > this.preUpgradeStat)
            {
                ball.Dmg = ball.Dmg + (this.UpgradeAmount * (ball.SpeedMultiplier - this.preUpgradeStat)) / 10;
            }
        }

        public override void BeforeUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.SpeedMultiplier;
        }

        public override void PerformUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.SpeedMultiplier;
            base.PerformUpgrade(player);
        }
    }
}
