using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class DamageWhenArmor : BasePersistentUpgrade
    {
        public DamageWhenArmor(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.DAMAGEUPGRADE);
            this.Tags.Add(UpgradeTags.TRIGGERONARMORUPGRADE);
        }

        public override string Description => $"Damage+{this.UpgradeAmount} every armor gained.";

        public override int BorderColor => Colors.BROWN;
        public override int FillColor => Colors.ROSE;

        public override void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            var damageIncrease = (this.UpgradeAmount * triggerStatIncrease);
            ball.IncreaseStat(UpgradeTags.DAMAGEUPGRADE, damageIncrease, triggerUpgradeDepth);
            base.Trigger(ball, increasedStat, triggerStatIncrease, triggerUpgradeDepth);
        }
    }
}
