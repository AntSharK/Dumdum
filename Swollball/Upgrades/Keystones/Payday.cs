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

        public override string Description => $"At the start of every round, gain {this.UpgradeAmount} credit for every 100 points from the previous round.";

        public override int BorderColor => 15662848; // EEFF00
        public override int FillColor => 12237498; // BABABA

        public override void StartNextRound(Player player)
        {
            var creditsGained = player.PlayerScore.RoundScore * this.UpgradeAmount * 0.01;
            if (creditsGained > 0)
            {
                player.Economy.CreditsLeft = player.Economy.CreditsLeft + Convert.ToInt32(Math.Floor(creditsGained));
            }

            base.StartNextRound(player);
        }
    }
}
