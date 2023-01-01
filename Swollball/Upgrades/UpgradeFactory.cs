using Swollball.Upgrades.Keystones;
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
            var rng = Rng.Next(5);
            switch (rng)
            {
                case 0:
                    return new DamageUpgrade(3, 3);
                case 1:
                    return new ArmorUpgrade(1, 3);
                case 2:
                    return new HpUpgrade(5, 3);
                case 3:
                    return new SizeUpgrade(11, 2);
                case 4:
                    return new SpeedUpgrade(30, 2);
                default:
                    return BlankUpgrade.Instance.First();
            }
        }

        public static IUpgrade GetKeystone_Tier1()
        {
            var rng = Rng.Next(4);
            switch (rng)
            {
                case 0:
                    return new Giant(1, 3);
                case 1:
                    return new Bulwark(1, 4);
                case 2:
                    return new Lifesteal(2, 4);
                case 3:
                    return new Harden(1, 5);
                default:
                    return BlankUpgrade.Instance.First();
            }
        }

        public static void FillShop_Tier1(Dictionary<string, IUpgrade> currentUpgrades, int shopSize)
        {
            while (currentUpgrades.Count < shopSize)
            {
                var random = Rng.Next(10);
                IUpgrade generatedUpgrade;
                if (random < 7)
                {
                    generatedUpgrade = UpgradeFactory.GetUpgrade_Tier1();
                }
                else
                {
                    generatedUpgrade = UpgradeFactory.GetKeystone_Tier1();
                }

                
                currentUpgrades[generatedUpgrade.ServerId] = generatedUpgrade;
            }
        }
    }
}
