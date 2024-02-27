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

        public double UpgradesCreated = 0;
        public double UpgradesApplied = 0;

        public Weapon(string weaponName)
        {
            this.Name = weaponName;
        }
    }
}
