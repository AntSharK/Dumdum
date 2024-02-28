﻿using System.Drawing;
using Common;
using Common.Util;

namespace Octoprotecto
{
    /// <summary>
    /// All public properties are serialized by SignalR
    /// </summary>
    public class Octopus : Player
    {
        public double DesiredX { get; set; }
        public double DesiredY { get; set; }
        public int Tint { get; set; }
        public double Speed { get; set; } = 0.1497; // Expressed as distance covered per millisecond
        public int MaxHitPoints { get; set; } = 998;
        public int Points { get; set; } = 20;
        public int TotalDeaths { get; set; } = 0;
        public int Luck { get; set; } = 0;
        public int Armor { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public List<Weapon> Weapons { get; } = new List<Weapon>();
        public int RefreshCost = 1;

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
            return 10 + this.TotalDeaths * 5;
        }

        internal void GenerateNewUpgrades()
        {
            this.RefreshCost = this.RefreshCost * 2;
            foreach(var weapon in this.Weapons)
            {
                weapon.GenerateUpgrades(this.Luck);
            }

            // TODO: Generate upgrades for main body
        }

        internal void NextRound()
        {
            this.IsActive = false;
            this.GenerateNewUpgrades();
            this.RefreshCost = 1;
            this.Points = this.Points + 10;
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
