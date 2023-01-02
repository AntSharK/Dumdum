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
            var rng = Rng.Next(14);
            switch (rng)
            {
                case 0:
                case 1:
                    return new DamageUpgrade(3, 3);
                case 2:
                case 3:
                    return new ArmorUpgrade(1, 3);
                case 4:
                case 5:
                    return new HpUpgrade(5, 3);
                case 6:
                case 7:
                    return new SizeUpgrade(11, 2);
                case 8:
                case 9:
                    return new SpeedUpgrade(30, 2);
                case 10:
                    return new Giant(1, 3);
                case 11:
                    return new Bulwark(1, 4);
                case 12:
                    return new Feast(2, 4);
                case 13:
                    return new Harden(1, 5);
                default:
                    return BlankUpgrade.Instance.First();
            }
        }

        public static void FillShop_Tier1(Dictionary<string, IUpgrade> currentUpgrades, int shopSize, int shopTier)
        {
            switch (shopTier)
            {
                case 1:
                    while (currentUpgrades.Count < shopSize)
                    {
                        var generatedUpgrade = GetUpgrade_Tier1();
                        currentUpgrades[generatedUpgrade.ServerId] = generatedUpgrade;
                    }
                    break;
            }
        }
    }
}
