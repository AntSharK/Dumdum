namespace Octoprotecto
{
    internal class TentacleSpecialUpgrade : Upgrade<Weapon>
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

        public TentacleSpecialUpgrade(UpgradeType stat)
        {
            this.upgradeType = stat;
            switch (this.upgradeType)
            {
                case UpgradeType.Split:
                    this.displayName = "Split";
                    this.description = "Halves damage, then spawns a new tentacle with the same stats (Max once per tentacle).";
                    this.baseCost = 1;
                    this.incrementCost = 0;
                    this.MaxLimit = 1;
                    break;
                default:
                    this.displayName = "Unknown";
                    this.description = "Unknown";
                    break;
            }
        }

        public override void ApplyUpgrade(Weapon weapon)
        {
            switch (this.upgradeType)
            {
                case UpgradeType.Split:
                    weapon.ProjectileDamage = weapon.ProjectileDamage / 2;
                    var splitWeapon = new Weapon(weapon.Owner, weapon.Owner.Weapons.Count().ToString());
                    splitWeapon.ProjectileDamage = weapon.ProjectileDamage;
                    splitWeapon.FireRate = weapon.FireRate;
                    splitWeapon.Spread = weapon.Spread;
                    splitWeapon.ProjectileSpeed = weapon.ProjectileSpeed;
                    splitWeapon.Range = weapon.Range;

                    splitWeapon.TrackedUpgrades.Add(this); // The split tentacle cannot be split again
                    weapon.TrackedUpgrades.Add(this);

                    // Find the index of this weapon and the new weapon after this one
                    var idx = weapon.Owner.Weapons.IndexOf(weapon);
                    if (idx <= 0) idx = 0;
                    weapon.Owner.Weapons.Insert(idx, splitWeapon);
                    break;
            }

            base.ApplyUpgrade(weapon);
        }

        public enum UpgradeType
        {
            Split
        }
    }
}
