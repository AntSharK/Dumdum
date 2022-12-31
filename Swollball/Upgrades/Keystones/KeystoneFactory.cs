using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    public static class KeystoneFactory
    {
        private static Random Rng = new Random();

        private static IUpgrade GetKeystone_Tier1()
        {
            var rng = Rng.Next(3);
            switch (rng)
            {
                case 0:
                    return new Giant(1);
                case 1:
                    return new Bulwark(1);
                case 2:
                    return new Lifesteal(1);
                default:
                    return BlankUpgrade.Instance.First();
            }
        }

        public static void FillShop_Tier1(Dictionary<string, IUpgrade> currentUpgrades)
        {
            // Keystones always replace the entire shop
            const int SHOPSIZE = 3;
            while (currentUpgrades.Count < SHOPSIZE)
            {
                var generatedUpgrade = KeystoneFactory.GetKeystone_Tier1();
                currentUpgrades[generatedUpgrade.ServerId] = generatedUpgrade;
            }
        }
    }
}
