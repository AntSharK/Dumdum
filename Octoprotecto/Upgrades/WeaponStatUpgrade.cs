namespace Octoprotecto
{
    internal class WeaponStatUpgrade : Upgrade<Weapon>
    {
        public override string DisplayName { get; set; }
        public override string Description { get; set; } = "Improves Stats";
        public override int UpgradeBaseCost { get; set; } = 16;
        public override int UpgradeIncrementCost { get; set; } = 3;
        public override string UpgradeName => "weaponstat";

        private WeaponStat statUpgraded;

        public WeaponStatUpgrade(WeaponStat stat)
        {
            this.statUpgraded = stat;
            switch (this.statUpgraded)
            {
                case WeaponStat.ProjectileSpeed:
                    this.DisplayName = "Speed+";
                    break;
                case WeaponStat.ProjectileSpread:
                    this.DisplayName = "Accuracy+";
                    break;
                case WeaponStat.Damage:
                    this.DisplayName = "Damage+";
                    break;
                case WeaponStat.Cooldown:
                    this.DisplayName = "FireRate+";
                    break;
                case WeaponStat.Range:
                    this.DisplayName = "Range+";
                    break;
                default:
                    this.DisplayName = "Unknown";
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
