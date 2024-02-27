using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class HpWhenCreditSpent : BasePersistentUpgrade
    {
        private SwollballPlayer? player;

        public HpWhenCreditSpent(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.CASHUPGRADE);
            this.Tags.Add(UpgradeTags.ENHANCEMENT);
        }

        public override string Description => $"Gain {this.UpgradeAmount} HP per credit spent on a purchase.";

        public override int BorderColor => Colors.BLACK;
        public override int FillColor => Colors.PERIWINKLE;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            this.player = player; // Store the player
            base.PerformUpgrade(player);
        }

        public override void AnotherUpgradePurchased(IUpgrade upgrade)
        {
            base.AnotherUpgradePurchased(upgrade);
            if (this.player != null)
            {
                this.player.Ball.IncreaseStat(UpgradeTags.HPUPGRADE, upgrade.Cost * this.UpgradeAmount, 0);
            }
        }
    }
}
