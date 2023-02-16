using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class DamageWhenSpeed : BasePersistentUpgrade
    {
        public DamageWhenSpeed(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.UPGRADEMODIFIER);
            this.Tags.Add(UpgradeTags.DAMAGEUPGRADE);
        }

        public override string Description => $"Damage+{this.UpgradeAmount} for every 10 speed gained";

        public override int BorderColor => UpgradeColors.BROWN;
        public override int FillColor => UpgradeColors.SKYBLUE;

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
