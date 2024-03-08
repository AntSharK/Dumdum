namespace Octoprotecto
{
    public class OctopusTrackedUpgrade : Upgrade<Octopus>
    {
        private string displayName;
        private string description;
        private int baseCost;
        private int incrementCost;
        public override string DisplayName => this.displayName;
        public override string Description => this.description;
        public override int UpgradeBaseCost => this.baseCost;
        public override int UpgradeIncrementCost => this.incrementCost;
        public override string UpgradeName => "octopustrackedupgrade";

        private UpgradeType statUpgraded;

        public OctopusTrackedUpgrade(UpgradeType stat)
        {
            this.statUpgraded = stat;
            switch (this.statUpgraded)
            {
                case UpgradeType.ArmorWhenHit:
                    this.displayName = "Toughen";
                    this.description = "When hit, Armor+1 for this round";
                    this.baseCost = 8;
                    this.incrementCost = 2;
                    break;
                case UpgradeType.PointsWhenHit:
                    this.displayName = "Insurance";
                    this.description = "When hit, Gain 1 Point";
                    this.baseCost = 10;
                    this.incrementCost = 5;
                    break;
                default:
                    this.displayName = "Unknown";
                    this.description = "Unknown";
                    break;
            }
        }

        public override void ReadTargetProperties(Octopus octopus)
        {
            base.ReadTargetProperties(octopus);
            var numberOfExistingUpgrades = octopus.TrackedUpgrades.Count(c => c.DisplayName == this.DisplayName);
            this.description = this.description + " (owned: " + numberOfExistingUpgrades + ")";
            this.Cost = this.UpgradeBaseCost + octopus.TrackedUpgrades.Count * this.UpgradeIncrementCost;
        }

        public override void ApplyUpgrade(Octopus octopus)
        {
            octopus.TrackedUpgrades.Add(this); // All of the behavior is client-side and determined by the DisplayName
            base.ApplyUpgrade(octopus);
        }

        public enum UpgradeType
        {
            ArmorWhenHit,
            PointsWhenHit,
        }
    }
}
