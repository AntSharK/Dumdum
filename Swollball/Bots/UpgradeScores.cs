using Swollball.Upgrades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    public static class UpgradeScores
    {
        public static int Random(IUpgrade u)
        {
            return 1;
        }

        private static Dictionary<string, int> ArmorScores = new Dictionary<string, int>()
        {
            { UpgradeFactory.Names.Apple, 1 },
            { UpgradeFactory.Names.Bulwark, 3 },
            { UpgradeFactory.Names.Vanguard, 7 },
            { UpgradeFactory.Names.Banana, 5 },
            { UpgradeFactory.Names.Ketones, 6 },
        };

        private static Dictionary<string, int> FlatDamageScores = new Dictionary<string, int>()
        {
            { UpgradeFactory.Names.Tofu, 1 },
            { UpgradeFactory.Names.Bacon, 2 },
            { UpgradeFactory.Names.Wagyu, 3 },
        };

        private static Dictionary<string, int> SustainScores = new Dictionary<string, int>()
        {
            { UpgradeFactory.Names.Brocolli, 1 },
            { UpgradeFactory.Names.BROcolli, 3 },
            { UpgradeFactory.Names.Feast, 4 },
            { UpgradeFactory.Names.Harden, 5 },
            { UpgradeFactory.Names.Reinforce, 8 },
            { UpgradeFactory.Names.Siphon, 9 },
        };

        /// <summary>
        /// Prioritizes bulwark and armor
        /// </summary>
        public static int ArmorBulwarker(IUpgrade u)
        {
            if (FlatDamageScores.ContainsKey(u.UpgradeName))
            {
                return FlatDamageScores[u.UpgradeName] * 2;
            }

            if (SustainScores.ContainsKey(u.UpgradeName))
            {
                return SustainScores[u.UpgradeName];
            }

            if (ArmorScores.ContainsKey(u.UpgradeName))
            {
                return ArmorScores[u.UpgradeName] * 5;
            }

            return -1;
        }

        /// <summary>
        /// Priotizes damage and sustain
        /// </summary>
        public static int DamageSustain(IUpgrade u)
        {
            if (FlatDamageScores.ContainsKey(u.UpgradeName))
            {
                return FlatDamageScores[u.UpgradeName] * 4;
            }

            if (SustainScores.ContainsKey(u.UpgradeName))
            {
                return SustainScores[u.UpgradeName] * 5;
            }

            if (ArmorScores.ContainsKey(u.UpgradeName))
            {
                return ArmorScores[u.UpgradeName] * 1;
            }

            return -1;
        }

        /// <summary>
        /// Priotizes armor and sustain
        /// </summary>
        public static int ArmorSustain(IUpgrade u)
        {
            if (FlatDamageScores.ContainsKey(u.UpgradeName))
            {
                return FlatDamageScores[u.UpgradeName] * 1;
            }

            if (SustainScores.ContainsKey(u.UpgradeName))
            {
                return SustainScores[u.UpgradeName] * 5;
            }

            if (ArmorScores.ContainsKey(u.UpgradeName))
            {
                return ArmorScores[u.UpgradeName] * 3;
            }

            return -1;
        }
    }
}
