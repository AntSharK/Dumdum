using Common.Util;

namespace Octoprotecto
{
    public abstract class WeaponUpgrade
    {
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

        public virtual void ApplyPostUpgrade(Weapon weapon)
        {
            // Do nothing
        }
    }
}
