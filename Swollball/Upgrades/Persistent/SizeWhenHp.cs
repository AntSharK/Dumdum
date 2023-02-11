using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class SizeWhenHp : BasePersistentUpgrade
    {
        public SizeWhenHp(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.UPGRADEMODIFIER);
            this.Tags.Add(UpgradeTags.SIZEUPGRADE);
        }

        public override string Description => $"Size+{this.UpgradeAmount} every 10 hp gained";

        public override int BorderColor => 43775; // 00AAFF
        public override int FillColor => 11259375; // ABCDEF

        public override void AfterUpgrade(Player player)
        {
            var ball = player.Ball;
            if (ball.Hp > this.preUpgradeStat)
            {
                ball.SizeMultiplier = ball.SizeMultiplier + (this.UpgradeAmount * (ball.Hp - this.preUpgradeStat))/10;
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
