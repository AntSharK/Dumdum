namespace Swollball.Upgrades
{
    public class CreditWhenHp : BasePersistentUpgrade
    {
        private Player? player;

        public CreditWhenHp(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.CASHUPGRADE);
            this.Tags.Add(UpgradeTags.TRIGGERONHPUPGRADE);
        }

        public override string Description => $"Gain {this.UpgradeAmount} credits when you gain HP.";

        public override int BorderColor => UpgradeColors.BLACK;
        public override int FillColor => UpgradeColors.PERIWINKLE;

        public override void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            if (this.player != null)
            {
                this.player.Economy.CreditsLeft += triggerStatIncrease;
            }

            base.Trigger(ball, increasedStat, triggerStatIncrease, triggerUpgradeDepth);
        }

        public override void PerformUpgrade(Player player)
        {
            this.player = player; // Store the player
            base.PerformUpgrade(player);
        }
    }
}
