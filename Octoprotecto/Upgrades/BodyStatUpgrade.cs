namespace Octoprotecto
{
    internal class BodyStatUpgrade : Upgrade<Octopus>
    {
        private string displayName;
        public override string DisplayName => this.displayName;
        public override string Description => "Improves Stats";
        public override int UpgradeBaseCost => 21;
        public override int UpgradeIncrementCost => 5;
        public override string UpgradeName => "bodystat";

        private BodyStat statUpgraded;

        public BodyStatUpgrade(BodyStat stat)
        {
            this.statUpgraded = stat;
            switch (this.statUpgraded)
            {
                case BodyStat.Armor:
                    this.displayName = "Armor+";
                    break;
                case BodyStat.Speed:
                    this.displayName = "Playerspeed+";
                    break;
                case BodyStat.MaxHp:
                    this.displayName = "Maxhp+";
                    break;
                case BodyStat.CollisionDamage:
                    this.displayName = "Collision+";
                    break;
                default:
                    this.displayName = "Unknown";
                    break;
            }
        }

        public override void ApplyUpgrade(Octopus octopus)
        {
            switch (this.statUpgraded)
            {
                case BodyStat.Armor:
                    octopus.Armor += 15;
                    break;
                case BodyStat.Speed:
                    octopus.Speed += 0.05;
                    break;
                case BodyStat.MaxHp:
                    octopus.MaxHitPoints += 102;
                    break;
                case BodyStat.CollisionDamage:
                    octopus.CollisionDamage += 50;
                    break;
            }

            base.ApplyUpgrade(octopus);
        }
    }

    public enum BodyStat
    {
        Armor,
        MaxHp,
        Speed,
        CollisionDamage
    }
}
