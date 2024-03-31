namespace Octoprotecto
{
    public class OctopusTrackedUpgrade : Upgrade<Octopus>
    {
        public override string DisplayName { get; set; }
        public override string Description { get; set; }
        public override int UpgradeBaseCost { get; set; }
        public override int UpgradeIncrementCost { get; set; }
        public override string UpgradeName => "octopustrackedupgrade";

        private UpgradeType upgradeType;

        public OctopusTrackedUpgrade(UpgradeType stat)
        {
            this.upgradeType = stat;
            switch (this.upgradeType)
            {
                case UpgradeType.ArmorWhenHit:
                    this.DisplayName = "Toughen";
                    this.Description = "When hit, Armor+2 for this round";
                    this.UpgradeBaseCost = 20;
                    this.UpgradeIncrementCost = 2;
                    this.MaxLimit = 10;
                    break;
                case UpgradeType.PointsWhenHit:
                    this.DisplayName = "Insurance";
                    this.Description = "When hit, Gain 1 Point";
                    this.UpgradeBaseCost = 10;
                    this.UpgradeIncrementCost = 5;
                    this.MaxLimit = 15;
                    break;
                case UpgradeType.Integrate:
                    this.DisplayName = "Integrate";
                    this.Description = "Resets upgrade costs";
                    this.UpgradeBaseCost = 100;
                    this.UpgradeIncrementCost = 0;
                    this.MaxLimit = 1;
                    break;
                case UpgradeType.Renew:
                    this.DisplayName = "Renew";
                    this.Description = "Resets respawn costs";
                    this.UpgradeBaseCost = 80;
                    this.UpgradeIncrementCost = 0;
                    this.MaxLimit = 2;
                    break;
                default:
                    this.DisplayName = "Unknown";
                    this.Description = "Unknown";
                    break;
            }
        }

        public override void ReadTargetProperties(Octopus octopus)
        {
            base.ReadTargetProperties(octopus);
            this.AugmentTrackedProperties(octopus);
        }

        public override void ApplyUpgrade(Octopus octopus)
        {
            switch (this.upgradeType)
            {
                case UpgradeType.Integrate:
                    octopus.UpgradesApplied = -1;
                    break;
                case UpgradeType.Renew:
                    octopus.TotalDeaths = 0;
                    break;
                default: // For everything else, the behavior is client-side
                    break;
            }

            this.IncrementUpgradeCount(octopus);
            base.ApplyUpgrade(octopus);
        }

        public enum UpgradeType
        {
            ArmorWhenHit,
            PointsWhenHit,
            Integrate,
            Renew,
        }
    }
}
