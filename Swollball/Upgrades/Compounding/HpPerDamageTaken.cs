using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class HpPerDamageTaken : BaseUpgrade
    {
        public HpPerDamageTaken(int value, int cost, string name) : base(value, cost, name)
        {
        }

        public override string Description => $"HP+{this.UpgradeAmount} for every 10 damage taken last round.";
        public override int BorderColor => Colors.RED;
        public override int FillColor => Colors.LAVENDER;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            var damageTaken = player.PlayerScore.RoundDamageReceived;
            if (damageTaken > 0)
            {
                var hpIncrease = this.UpgradeAmount * damageTaken / 10;
                player.Ball.IncreaseStat(UpgradeTags.HPUPGRADE, hpIncrease, 0);
            }
            base.PerformUpgrade(player);
        }

    }
}
