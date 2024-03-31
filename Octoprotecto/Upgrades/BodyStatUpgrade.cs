namespace Octoprotecto
{
    internal class BodyStatUpgrade : Upgrade<Octopus>
    {
        public override string DisplayName { get; set; }
        public override string Description { get; set; } = "Improves Stats";
        public override int UpgradeBaseCost { get; set; } = 21;
        public override int UpgradeIncrementCost { get; set; } = 5;
        public override string UpgradeName => "bodystat";

        private BodyStat statUpgraded;

        public BodyStatUpgrade(BodyStat stat)
        {
            this.statUpgraded = stat;
            switch (this.statUpgraded)
            {
                case BodyStat.Armor:
                    this.DisplayName = "Armor+";
                    break;
                case BodyStat.Speed:
                    this.DisplayName = "Playerspeed+";
                    break;
                case BodyStat.MaxHp:
                    this.DisplayName = "Maxhp+";
                    break;
                case BodyStat.CollisionDamage:
                    this.DisplayName = "Collision+";
                    break;
                case BodyStat.Luck:
                    this.DisplayName = "Luck+";
                    break;
                default:
                    this.DisplayName = "Unknown";
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
                    octopus.CollisionDamage += 77;
                    break;
                case BodyStat.Luck:
                    octopus.Luck += 3;
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
        CollisionDamage,
        Luck
    }
}
