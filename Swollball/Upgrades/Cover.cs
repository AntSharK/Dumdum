using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class Cover : BaseUpgrade
    {
        public Cover(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Cover+";

        public override string Description => $"Increases HP by {this.UpgradeAmount} for every 10 damage you took last round.";

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
