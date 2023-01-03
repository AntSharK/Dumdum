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

        public override void StartNextRound(Player player)
        {
            var creditsGained = player.PlayerScore.RoundScore * 0.1 * this.UpgradeAmount;
            if (creditsGained > 0)
            {
                player.Economy.CreditsLeft = player.Economy.CreditsLeft + Convert.ToInt32(Math.Floor(creditsGained));
            }

            base.StartNextRound(player);
        }
    }
}
