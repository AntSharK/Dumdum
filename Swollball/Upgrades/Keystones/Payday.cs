using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public class Payday : BaseKeystone
    {
        public Payday(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Payday";

        public override string Description => $"Every round, gain {this.UpgradeAmount} credits for every 100 damage done in the previous round.";

        public override int BorderColor => 15662848; // EEFF00
        public override int FillColor => 12237498; // BABABA

        public override void StartNextRound(Player player)
        {
            var creditsGained = player.PlayerScore.RoundDamageDone * this.UpgradeAmount * 0.01;
            if (creditsGained > 0)
            {
                player.Economy.CreditsLeft = player.Economy.CreditsLeft + Convert.ToInt32(Math.Floor(creditsGained));
            }

            base.StartNextRound(player);
        }
    }
}
