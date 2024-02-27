using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class ArmorWhenHp : BasePersistentUpgrade
    {
        public ArmorWhenHp(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.ARMORUPGRADE);
            this.Tags.Add(UpgradeTags.TRIGGERONHPUPGRADE);
        }

        public override string Description => $"Armor+{this.UpgradeAmount} whenever you gain 10 HP.";

        public override int BorderColor => Colors.GREEN;
        public override int FillColor => Colors.ROSE;

        public override void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            var armorIncrease = (this.UpgradeAmount * triggerStatIncrease) / 10;
            ball.IncreaseStat(UpgradeTags.ARMORUPGRADE, armorIncrease, triggerUpgradeDepth);
            base.Trigger(ball, increasedStat, triggerStatIncrease, triggerUpgradeDepth);
        }
    }
}
