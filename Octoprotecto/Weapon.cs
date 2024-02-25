namespace Octoprotecto
{
    public class Weapon
    {
        public int FireRate { get; set; } = 200; // Milliseconds between shots
        public float Spread { get; set; } = 0.4f; // Total radians - equally spread in both directions
        public double Range { get; set; } = 500;
        public double ProjectileDamage { get; set; } = 19;
        public double ProjectileSpeed { get; set; } = 500; // Units per second
        public List<WeaponUpgrade> Upgrades { get; } = new List<WeaponUpgrade>();
    }

    public class WeaponUpgrade
    {
        public string Name { get; set; }
    }
}
