using Common.Util;

namespace Octoprotecto
{
    public abstract class WeaponUpgrade
    {
        public string Name { get; set; } = "Default";
        public abstract string DisplayName { get; }
        public abstract string Description { get; }

        public virtual int BorderColor { get; } = Colors.BLACK;

        public virtual int FillColor { get; } = Colors.WHITE;
        public virtual int Cost { get; set; } = 0;

        public virtual void ApplyUpgrade(Weapon weapon)
        {
            weapon.UpgradesApplied++;
            foreach (var trackedUpgrade in weapon.TrackedUpgrades)
            {
                trackedUpgrade.ApplyPostUpgrade(weapon);
            }
        }

        // Sets the cost and the name
        public virtual void ReadWeaponProperties(Weapon weapon)
        {
            const int UPGRADEBASECOST = 5;
            const int UPGRADEINCREMENTCOST = 1;

            this.Name = weapon.Name + weapon.UpgradesCreated;
            this.Cost = UPGRADEBASECOST + weapon.UpgradesApplied * UPGRADEINCREMENTCOST;
        }

        protected virtual void ApplyPostUpgrade(Weapon weapon)
        {
            // Do nothing
        }
    }
}
