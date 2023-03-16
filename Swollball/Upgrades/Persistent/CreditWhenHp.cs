using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class CreditWhenHp : BasePersistentUpgrade
    {
        private SwollballPlayer? player;

        public CreditWhenHp(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.CASHUPGRADE);
            this.Tags.Add(UpgradeTags.TRIGGERONHPUPGRADE);
        }

        public override string Description => $"Gain {this.UpgradeAmount} credits when you gain 10 HP.";

        public override int BorderColor => UpgradeColors.BLACK;
        public override int FillColor => UpgradeColors.PERIWINKLE;

        public override void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            var creditIncrease = (this.UpgradeAmount * triggerStatIncrease) / 10;
            if (this.player != null)
            {
                this.player.Economy.CreditsLeft += creditIncrease;
            }

            base.Trigger(ball, increasedStat, triggerStatIncrease, triggerUpgradeDepth);
        }

        public override void PerformUpgrade(SwollballPlayer player)
        {
            this.player = player; // Store the player
            base.PerformUpgrade(player);
        }
    }
}
