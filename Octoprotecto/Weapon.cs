using Common.Util;

namespace Octoprotecto
{
    public class Weapon : IUpgradeTracker<Upgrade<Weapon>>
    {
        public double FireRate { get; set; } = 600; // Milliseconds between shots
        public double Spread { get; set; } = 1.4; // Total radians - equally spread in both directions
        public double Range { get; set; } = 250;
        public double ProjectileDamage { get; set; } = 19;
        public double ProjectileSpeed { get; set; } = 350; // Units per second
        public List<Upgrade<Weapon>> TrackedUpgrades { get; } = new List<Upgrade<Weapon>>();
        public Dictionary<string, Upgrade<Weapon>> PurchasableUpgrades { get; } = new Dictionary<string, Upgrade<Weapon>>();
        public string Name { get; private set; }

        public int UpgradesCreated { get; set; } = 0;
        public int UpgradesApplied { get; set; } = 0;

        public Weapon(string weaponName)
        {
            this.Name = weaponName;
        }

        public void GenerateUpgrades(int luck)
        {
            this.PurchasableUpgrades.Clear();
            var numberOfBaseUpgrades = 1;
            if (luck > -5) {
                var randomSeed = Utils.Rng.Next(luck + 20);
                if (randomSeed >= 75)
                {
                    numberOfBaseUpgrades = 4;
                }
                else if (randomSeed >= 35)
                {
                    numberOfBaseUpgrades = 3;
                }
                else if (randomSeed >= 15)
                {
                    numberOfBaseUpgrades = 2;
                }
            }

            var possibleUpgrades = new List<Upgrade<Weapon>>() {
                new WeaponStatUpgrade(WeaponStat.Cooldown),
                new WeaponStatUpgrade(WeaponStat.ProjectileSpeed),
                new WeaponStatUpgrade(WeaponStat.ProjectileSpread),
                new WeaponStatUpgrade(WeaponStat.Damage),
                new WeaponStatUpgrade(WeaponStat.Range),
            };

            Upgrade<Weapon>.GenerateBaseUpgrades(possibleUpgrades, numberOfBaseUpgrades, this);
            // TODO: Generate augmentations, not just stat upgrades
        }
    }
}
