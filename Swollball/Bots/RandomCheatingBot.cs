using Swollball.PlayerData;
using Swollball.Upgrades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    /// <summary>
    /// The random cheating bot starts at tier 4 and buys random upgrades
    /// </summary>
    public class RandomCheatingBot : SwollballPlayer
    {
        public RandomCheatingBot(string name, string roomName) 
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
            while (this.Economy.CreditsLeft > 0)
            {
                var upgradeToApply = this.CurrentUpgrades.Values.First();
                if (upgradeToApply.UpgradeName == string.Empty)
                {
                    this.RefreshShop();
                }

                var upgradeId = upgradeToApply.ServerId;

                if (!this.ApplyUpgrade(upgradeId)) // Avoid infinite loops when unable to buy upgrades
                {
                    this.RefreshShop();
                }
            }
        }
    }
}
