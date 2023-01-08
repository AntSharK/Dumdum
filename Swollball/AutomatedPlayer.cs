﻿using Swollball.Upgrades;
using Swollball.Upgrades.Keystones;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    public class AutomatedPlayer : Player
    {
        public AutomatedPlayer(string name, string roomName) 
            : base(name, "TestConnectionId", roomName)
        {
            this.Economy.ShopTier = 4; // Bots cheat and start with a tier 4 shop
            this.BuyRandomUpgrades();
        }

        public override void StartNextRound()
        {
            base.StartNextRound();
            BuyRandomUpgrades();
        }

        private void BuyRandomUpgrades()
        {
            // DO AI THINGS - Just buy random upgrades
            while (this.CurrentUpgrades.Count > 0)
            {
                var upgradeId = this.CurrentUpgrades.Keys.First();
                this.ApplyUpgrade(upgradeId);
            }

        }
    }
}
