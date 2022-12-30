using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public static class UpgradeFactory
    {
        private static Random Rng = new Random();

        private static IUpgrade GetUpgrade_Tier1()
        {
            var rng = Rng.Next(3);
            switch (rng)
            {
                case 0:
                    return new DamageUpgrade(3);
                case 1:
                    return new ArmorUpgrade(1);
                case 2:
                    return new HpUpgrade(5);
                default:
                    return BlankUpgrade.Instance.First();
            }
        }

        public static void FillShop_Tier1(Dictionary<string, IUpgrade> currentUpgrades)
        {
            const int SHOPSIZE = 3;
            while (currentUpgrades.Count < SHOPSIZE)
            { 
                var generatedUpgrade = UpgradeFactory.GetUpgrade_Tier1();
                currentUpgrades[generatedUpgrade.ServerId] = generatedUpgrade;
            }
        }
    }
}
