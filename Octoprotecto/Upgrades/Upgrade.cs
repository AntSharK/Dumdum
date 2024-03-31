using Common.Util;

namespace Octoprotecto
{
    public abstract class Upgrade<TargetType> where TargetType : IUpgradeTracker<Upgrade<TargetType>>
    {
        public string Name { get; set; } = "Default";
        public abstract string DisplayName { get; }
        public abstract string Description { get; }
        public virtual int Cost { get; set; } = 0;
        public abstract int UpgradeBaseCost { get; }
        public abstract int UpgradeIncrementCost { get; }
        public abstract string UpgradeName { get; }
        public int MaxLimit { get; set; } = -1; // Defaults to negative to be disabled
        public int CurrentAmount { get; set; } = 1;

        public virtual void ApplyUpgrade(TargetType target)
        {
            target.UpgradesApplied++;
        }

        // Sets the cost and the name
        public virtual void ReadTargetProperties(TargetType target)
        {
            this.Name = target.Name + this.UpgradeName + target.UpgradesCreated;
            this.Cost = this.UpgradeBaseCost + target.UpgradesApplied * this.UpgradeIncrementCost;
        }

        internal static void GenerateBaseUpgrades(List<Upgrade<TargetType>> possibleUpgrades, int numberOfUpgrades, TargetType target)
        {
            for (var i = possibleUpgrades.Count; i > numberOfUpgrades; i--)
            {
                possibleUpgrades.RemoveAt(Utils.Rng.Next(possibleUpgrades.Count));
            }

            foreach (var upgrade in possibleUpgrades)
            {
                target.UpgradesCreated++;
                upgrade.ReadTargetProperties(target);
                target.PurchasableUpgrades.Add(upgrade.Name, upgrade);
            }
        }

        public override bool Equals(object? obj)
        {
            var upg = obj as Upgrade<TargetType>;
            return upg != null && upg.DisplayName == this.DisplayName;
        }

        public override int GetHashCode()
        {
            return this.DisplayName.GetHashCode();
        }
    }
}
