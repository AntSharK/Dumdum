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

        private UpgradeType upgradeType;

        public OctopusTrackedUpgrade(UpgradeType stat)
        {
            this.upgradeType = stat;
            switch (this.upgradeType)
            {
                case UpgradeType.ArmorWhenHit:
                    this.displayName = "Toughen";
                    this.description = "When hit, Armor+2 for this round";
                    this.baseCost = 20;
                    this.incrementCost = 2;
                    this.MaxLimit = 10;
                    break;
                case UpgradeType.PointsWhenHit:
                    this.displayName = "Insurance";
                    this.description = "When hit, Gain 1 Point";
                    this.baseCost = 10;
                    this.incrementCost = 5;
                    this.MaxLimit = 15;
                    break;
                case UpgradeType.Integrate:
                    this.displayName = "Integrate";
                    this.description = "Resets upgrade costs";
                    this.baseCost = 100;
                    this.incrementCost = 0;
                    this.MaxLimit = 1;
                    break;
                case UpgradeType.Renew:
                    this.displayName = "Renew";
                    this.description = "Resets respawn costs";
                    this.baseCost = 80;
                    this.incrementCost = 0;
                    this.MaxLimit = 2;
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
            octopus.TrackedUpgrades.TryGetValue(this, out var existingUpgrade);
            var numberOfExistingUpgrades = existingUpgrade != null ? existingUpgrade.CurrentAmount : 0;
            this.description = this.description + " (owned: " + numberOfExistingUpgrades + (this.MaxLimit > 0 ? ("/" + this.MaxLimit + ")") : ")");

            var totalTrackedUpgradeCount = octopus.TrackedUpgrades.Sum(c => c.CurrentAmount);
            this.Cost = this.UpgradeBaseCost + totalTrackedUpgradeCount * this.UpgradeIncrementCost;
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

            octopus.TrackedUpgrades.TryGetValue(this, out var existingUpgrade);
            if (existingUpgrade != null)
            {
                existingUpgrade.CurrentAmount++;
            }
            else
            {
                octopus.TrackedUpgrades.Add(this);
            }

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
