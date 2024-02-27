using Common.Util;
using Octoprotecto.WeaponUpgrades;

namespace Octoprotecto
{
    public class Weapon
    {
        public double FireRate { get; set; } = 1000; // Milliseconds between shots
        public double Spread { get; set; } = 1.4; // Total radians - equally spread in both directions
        public double Range { get; set; } = 225;
        public double ProjectileDamage { get; set; } = 19;
        public double ProjectileSpeed { get; set; } = 350; // Units per second
        public List<WeaponUpgrade> TrackedUpgrades { get; } = new List<WeaponUpgrade>();
        public Dictionary<string, WeaponUpgrade> PurchasableUpgrades { get; } = new Dictionary<string, WeaponUpgrade>();
        public string Name { get; private set; }

        public int UpgradesCreated = 0;
        public int UpgradesApplied = 0;

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

            this.GenerateBaseUpgrades(numberOfBaseUpgrades);
        }

        private void GenerateBaseUpgrades(int numberOfUpgrades)
        {
            var possibleUpgrades = new List<WeaponUpgrade>() {
                new StatUpgrade(WeaponStat.ProjectileSpeed),
                new StatUpgrade(WeaponStat.ProjectileSpread),
                new StatUpgrade(WeaponStat.Damage),
                new StatUpgrade(WeaponStat.Cooldown),
            };

            for(var i = 4; i > numberOfUpgrades; i--)
            {
                possibleUpgrades.RemoveAt(Utils.Rng.Next(possibleUpgrades.Count - 1));
            }

            foreach (var upgrade in possibleUpgrades)
            {
                this.UpgradesCreated++;
                upgrade.Name = this.Name + this.UpgradesCreated;
                upgrade.Cost = 10 + this.UpgradesApplied;

                this.PurchasableUpgrades.Add(upgrade.Name, upgrade);
            }
        }
    }
}
