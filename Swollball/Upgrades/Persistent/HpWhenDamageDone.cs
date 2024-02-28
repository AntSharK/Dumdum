using Common.Util;

namespace Swollball.Upgrades
{
    public class HpWhenDamageDone : BasePersistentUpgrade
    {
        public HpWhenDamageDone(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.LIFESTEAL);
            this.Tags.Add(UpgradeTags.HPUPGRADE);
        }

        public override string Description => $"Regain {this.UpgradeAmount} HP for every 10 damage dealt.";

        public override int BorderColor => Colors.RED;
        public override int FillColor => Colors.SKYBLUE;
    }
}
