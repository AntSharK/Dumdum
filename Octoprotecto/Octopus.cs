using System.Drawing;
using Common;
using Common.Util;

namespace Octoprotecto
{
    /// <summary>
    /// All public properties are serialized by SignalR
    /// </summary>
    public class Octopus : Player, IUpgradeTracker<Upgrade<Octopus>>
    {
        public double DesiredX { get; set; }
        public double DesiredY { get; set; }
        public int Tint { get; set; }
        public double Speed { get; set; } = 0.1497; // Expressed as distance covered per millisecond
        public int MaxHitPoints { get; set; } = 998;
        public int Points { get; set; } = 20;
        public int TotalDeaths { get; set; } = 0;
        public int Luck { get; set; } = 0;
        public int Armor { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public List<Weapon> Weapons { get; } = new List<Weapon>();
        public int RefreshCost { get; set; } = 1;
        public List<Upgrade<Octopus>> TrackedUpgrades { get; } = new List<Upgrade<Octopus>>();
        public Dictionary<string, Upgrade<Octopus>> PurchasableUpgrades { get; } = new Dictionary<string, Upgrade<Octopus>>();
        public int UpgradesCreated { get; set; } = 0;
        public int UpgradesApplied { get; set; } = 0;

        public Octopus(string name, string connectionId, string roomName) 
            : base(name, connectionId, roomName)
        {
            const int STARTINGWEAPONCOUNT = 4;
            for (int i = 0; i < STARTINGWEAPONCOUNT; i++)
            {
                this.Weapons.Add(new Weapon(name + i));
            }
        }

        internal void SetRandomLocation(Rectangle octopiMovementBounds)
        {
            this.DesiredX = Utils.Rng.Next(octopiMovementBounds.Left, octopiMovementBounds.Right);
            this.DesiredY = Utils.Rng.Next(octopiMovementBounds.Top, octopiMovementBounds.Bottom);
        }

        internal int GetRespawnCost()
        {
            const int BASERESPAWNCOST = 10;
            const int INCREMENTALRESPAWNCOST = 5;
            return BASERESPAWNCOST + this.TotalDeaths * INCREMENTALRESPAWNCOST;
        }

        internal void GenerateNewUpgrades()
        {
            foreach(var weapon in this.Weapons)
            {
                weapon.GenerateUpgrades(this.Luck);
            }

            // TODO: Generate upgrades for main body
            this.PurchasableUpgrades.Clear();
        }

        internal void NextRound()
        {
            const int BASEREFRESHCOST = 1;
            const int POINTSPERROUND = 10;

            this.IsActive = false;
            this.GenerateNewUpgrades();
            this.RefreshCost = BASEREFRESHCOST;
            this.Points = this.Points + POINTSPERROUND;
        }

        internal bool TryPurchaseWeaponUpgrade(string upgradeId)
        {
            foreach (var weapon in this.Weapons)
            {
                foreach (var upgrade in weapon.PurchasableUpgrades)
                {
                    if (upgrade.Key == upgradeId)
                    {
                        if (this.Points >= upgrade.Value.Cost)
                        {
                            this.Points = this.Points - upgrade.Value.Cost;
                            upgrade.Value.ApplyUpgrade(weapon);
                            return true;
                        }
                    }
                }
            }

            return false;
        }
    }
}
