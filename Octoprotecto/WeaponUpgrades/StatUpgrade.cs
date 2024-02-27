namespace Octoprotecto.WeaponUpgrades
{
    internal class StatUpgrade : WeaponUpgrade
    {
        private string displayName;
        public override string DisplayName => this.displayName;

        public override string Description => "Improves Stats";
        private WeaponStat statUpgraded;

        public StatUpgrade(WeaponStat stat)
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
                    weapon.ProjectileSpeed += 15;
                    break;
                case WeaponStat.ProjectileSpread:
                    weapon.Spread = weapon.Spread * 0.95d;
                    break;
                case WeaponStat.Damage:
                    weapon.ProjectileDamage = weapon.ProjectileDamage + 1;
                    break;
                case WeaponStat.Cooldown:
                    weapon.FireRate = weapon.FireRate * 0.95d;
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
    }
}
