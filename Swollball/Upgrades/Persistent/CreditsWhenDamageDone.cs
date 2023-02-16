using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class CreditsWhenDamageDone : BasePersistentUpgrade
    {
        public CreditsWhenDamageDone(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.ONTURNSTART);
            this.Tags.Add(UpgradeTags.CASHUPGRADE);
        }

        public override string Description => $"Gain {this.UpgradeAmount} credits per round for every 100 damage done.";

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
