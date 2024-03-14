﻿using Common.Util;

namespace Octoprotecto
{
    public abstract class Upgrade<TargetType> where TargetType : IUpgradeTracker<Upgrade<TargetType>>
    {
        public string Name { get; set; } = "Default";
        public abstract string DisplayName { get; }
        public abstract string Description { get; }

        public virtual int BorderColor { get; } = Colors.BLACK;

        public virtual int FillColor { get; } = Colors.WHITE;
        public virtual int Cost { get; set; } = 0;
        public abstract int UpgradeBaseCost { get; }
        public abstract int UpgradeIncrementCost { get; }
        public abstract string UpgradeName { get; }
        public int MaxLimit { get; set; } = -1; // Defaults to negative to be disabled

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
    }
}
