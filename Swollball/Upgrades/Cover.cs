using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Cover : BaseUpgrade
    {
        public Cover(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"HP+{this.UpgradeAmount} for every 10 damage you took last round.";
        public override int BorderColor => 1157887; // 11AAFF
        public override int FillColor => 11193565; // AACCDD

        public override void PerformUpgrade(Player player)
        {
            var damageTaken = player.PlayerScore.RoundDamageReceived;
            if (damageTaken > 0) {
                player.Ball.Hp += this.UpgradeAmount * damageTaken / 10;
            }
            base.PerformUpgrade(player);
        }

    }
}
