namespace Octoprotecto
{
    internal class TentacleSpecialUpgrade : Upgrade<Weapon>
    {
        public override string DisplayName { get; set; }
        public override string Description { get; set; }
        public override int UpgradeBaseCost { get; set; }
        public override int UpgradeIncrementCost { get; set; }
        public override string UpgradeName => "octopustrackedupgrade";

        private UpgradeType upgradeType;

        public TentacleSpecialUpgrade(UpgradeType stat)
        {
            this.upgradeType = stat;
            switch (this.upgradeType)
            {
                case UpgradeType.Split:
                    this.DisplayName = "Split";
                    this.Description = "Halves damage, then spawns a new tentacle with the same stats";
                    this.UpgradeBaseCost = 100;
                    this.UpgradeIncrementCost = 0;
                    this.MaxLimit = 1;
                    break;

                case UpgradeType.Consume:
                    this.DisplayName = "Consume";
                    this.Description = "Restore 3 HP on hit";
                    this.UpgradeBaseCost = 15;
                    this.UpgradeIncrementCost = 5;
                    this.MaxLimit = 10;
                    break;

                case UpgradeType.Momentum:
                    this.DisplayName = "Momentum";
                    this.Description = "Bullet does 10% of speed as damage";
                    this.UpgradeBaseCost = 10;
                    this.UpgradeIncrementCost = 4;
                    this.MaxLimit = 10;
                    break;

                case UpgradeType.Propel:
                    this.DisplayName = "Propel";
                    this.Description = "Halves bullet speed, but makes bullet accelerate";
                    this.UpgradeBaseCost = 18;
                    this.UpgradeIncrementCost = 6;
                    this.MaxLimit = 3;
                    break;

                case UpgradeType.Integrate:
                    this.DisplayName = "Integrate";
                    this.Description = "Resets upgrade cost";
                    this.UpgradeBaseCost = 100;
                    this.UpgradeIncrementCost = 0;
                    this.MaxLimit = 1;
                    break;

                case UpgradeType.Caramelize:
                    this.DisplayName = "Caramelize";
                    this.Description = "On hit, restore 2 HP on hit to all allies (including yourself) in 250 range";
                    this.UpgradeBaseCost = 25;
                    this.UpgradeIncrementCost = 4;
                    this.MaxLimit = 10;
                    break;
                default:
                    this.DisplayName = "Unknown";
                    this.Description = "Unknown";
                    break;
            }
        }

        public override void ReadTargetProperties(Weapon weapon)
        {
            base.ReadTargetProperties(weapon);
            this.AugmentTrackedProperties(weapon);
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
                case UpgradeType.Propel:
                    weapon.ProjectileSpeed = weapon.ProjectileSpeed / 2;
                    break;
                case UpgradeType.Integrate:
                    weapon.UpgradesApplied = -1;
                    break;
                default: // For everything else, the behavior is client-side
                    break;
            }

            this.IncrementUpgradeCount(weapon);
            base.ApplyUpgrade(weapon);
        }

        public enum UpgradeType
        {
            Split,
            Consume,
            Momentum,
            Propel,
            Integrate,
            Caramelize,
        }
    }
}
