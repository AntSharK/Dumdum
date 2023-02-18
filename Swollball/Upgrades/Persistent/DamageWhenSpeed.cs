namespace Swollball.Upgrades
{
    public class DamageWhenSpeed : BasePersistentUpgrade
    {
        public DamageWhenSpeed(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.DAMAGEUPGRADE);
            this.Tags.Add(UpgradeTags.TRIGGERONSPEEDUPGRADE);
        }

        public override string Description => $"Damage+{this.UpgradeAmount} for every 10 speed gained";

        public override int BorderColor => UpgradeColors.BROWN;
        public override int FillColor => UpgradeColors.SKYBLUE;

        public override void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            var newUpgradeDepth = triggerUpgradeDepth + 1;
            var damageIncrease = (this.UpgradeAmount * triggerStatIncrease) / 10;
            ball.IncreaseStat(UpgradeTags.DAMAGEUPGRADE, damageIncrease, newUpgradeDepth);
            base.Trigger(ball, increasedStat, triggerStatIncrease, newUpgradeDepth);
        }
    }
}
