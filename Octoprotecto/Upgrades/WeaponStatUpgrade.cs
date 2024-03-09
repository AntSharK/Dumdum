namespace Octoprotecto
{
    internal class WeaponStatUpgrade : Upgrade<Weapon>
    {
        private string displayName;
        public override string DisplayName => this.displayName;
        public override string Description => "Improves Stats";
        public override int UpgradeBaseCost => 15;
        public override int UpgradeIncrementCost => 1;
        public override string UpgradeName => "weaponstat";

        private WeaponStat statUpgraded;

        public WeaponStatUpgrade(WeaponStat stat)
        {
            this.statUpgraded = stat;
            switch (this.statUpgraded)
            {
                case WeaponStat.ProjectileSpeed:
                    this.displayName = "Speed+";
                    break;
                case WeaponStat.ProjectileSpread:
                    this.displayName = "Accuracy+";
                    break;
                case WeaponStat.Damage:
                    this.displayName = "Damage+";
                    break;
                case WeaponStat.Cooldown:
                    this.displayName = "FireRate+";
                    break;
                case WeaponStat.Range:
                    this.displayName = "Range+";
                    break;
                default:
                    this.displayName = "Unknown";
                    break;
            }
        }

        public override void ApplyUpgrade(Weapon weapon)
        {
            switch (this.statUpgraded)
            {
                case WeaponStat.ProjectileSpeed:
                    weapon.ProjectileSpeed += 150;
                    break;
                case WeaponStat.ProjectileSpread:
                    weapon.Spread = weapon.Spread * 0.8d;
                    break;
                case WeaponStat.Damage:
                    weapon.ProjectileDamage = weapon.ProjectileDamage + 40;
                    break;
                case WeaponStat.Cooldown:
                    weapon.FireRate = weapon.FireRate * 0.8d;
                    break;
                case WeaponStat.Range:
                    weapon.Range = weapon.Range + 110;
                    break;
            }

            base.ApplyUpgrade(weapon);
        }
    }

    public enum WeaponStat
    {
        ProjectileSpeed,
        ProjectileSpread,
        Damage,
        Cooldown,
        Range,
    }
}
