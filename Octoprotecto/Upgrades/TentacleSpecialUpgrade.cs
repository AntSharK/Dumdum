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
                    this.description = "Halves damage, then spawns a new tentacle with the same stats";
                    this.baseCost = 100;
                    this.incrementCost = 0;
                    this.MaxLimit = 1;
                    break;

                case UpgradeType.Consume:
                    this.displayName = "Consume";
                    this.description = "Restore 1 HP on hit";
                    this.baseCost = 15;
                    this.incrementCost = 2;
                    this.MaxLimit = 10;
                    break;
                default:
                    this.displayName = "Unknown";
                    this.description = "Unknown";
                    break;
            }
        }

        public override void ReadTargetProperties(Weapon weapon)
        {
            base.ReadTargetProperties(weapon);
            var numberOfExistingUpgrades = weapon.TrackedUpgrades.Count(c => c.DisplayName == this.DisplayName);
            this.description = this.description + " (owned: " + numberOfExistingUpgrades + (this.MaxLimit > 0 ? ("/" + this.MaxLimit + ")") : ")");
            this.Cost = this.UpgradeBaseCost + weapon.TrackedUpgrades.Count * this.UpgradeIncrementCost;
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

                    // Find the index of this weapon and insert the new weapon after this one
                    var idx = weapon.Owner.Weapons.IndexOf(weapon);
                    if (idx <= 0) idx = 0;
                    weapon.Owner.Weapons.Insert(idx, splitWeapon);
                    break;
                default: // For everything else, the behavior is client-side
                    break;
            }

            weapon.TrackedUpgrades.Add(this); // All of the behavior is client-side and determined by the DisplayName
            base.ApplyUpgrade(weapon);
        }

        public enum UpgradeType
        {
            Split,
            Consume
        }
    }
}
