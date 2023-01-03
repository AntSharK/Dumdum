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

        // List containing the odds of getting a card, and the function to generate the card
        private static List<Tuple<int, Func<IUpgrade>>> Tier1UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(10, () => new DamageUpgrade(3, 3) as IUpgrade),
            Tuple.Create(10, () => new ArmorUpgrade(1, 3) as IUpgrade),
            Tuple.Create(10, () => new HpUpgrade(5, 2) as IUpgrade),
            Tuple.Create(10, () => new SizeUpgrade(15, 2) as IUpgrade),
            Tuple.Create(10, () => new SpeedUpgrade(30, 2) as IUpgrade),
            Tuple.Create(7, () => new Giant(1, 3) as IUpgrade),
            Tuple.Create(7, () => new Bulwark(1, 4) as IUpgrade),
            Tuple.Create(7, () => new Feast(2, 4) as IUpgrade),
        };

        // Maps from a number to a function generating an upgrade
        private static Lazy<Func<IUpgrade>[]> Tier1Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            var totalSize = 0;
            foreach (var upg in Tier1UpgradeOdds)
            {
                totalSize += upg.Item1;
            }

            var array = new Func<IUpgrade>[totalSize];
            var idx = 0;
            foreach (var upg in Tier1UpgradeOdds)
            {
                for(var i = 0; i < upg.Item1; i++)
                {
                    array[idx] = upg.Item2;
                    idx++;
                }
            }

            return array;
        });

        public static void FillShop(Dictionary<string, IUpgrade> currentUpgrades, int shopSize, int shopTier)
        {
            Func<IUpgrade>[] cardGenerator;
            switch (shopTier)
            {
                case 1:
                case 2:
                case 3:
                case 4: // TODO: All the different tier shops need to be generated
                    cardGenerator = Tier1Upgrades.Value;
                    break;
                default:
                    cardGenerator = TestUpgrades.Value;
                    break;
            }

            while (currentUpgrades.Count < shopSize)
            {
                var rng = Rng.Next(cardGenerator.Count());
                var generatedUpgrade = cardGenerator[rng]();
                currentUpgrades[generatedUpgrade.ServerId] = generatedUpgrade;
            }
        }

        // Test stuff
        private static List<Tuple<int, Func<IUpgrade>>> TestUpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(1, () => new Impulse(1, 1) as IUpgrade),
            Tuple.Create(1, () => new SpeedUpgrade(30, 1) as IUpgrade),
            Tuple.Create(1, () => new Harden(1, 5) as IUpgrade),
        };
        private static Lazy<Func<IUpgrade>[]> TestUpgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            var totalSize = 0;
            foreach (var upg in TestUpgradeOdds)
            {
                totalSize += upg.Item1;
            }

            var array = new Func<IUpgrade>[totalSize];
            var idx = 0;
            foreach (var upg in TestUpgradeOdds)
            {
                for (var i = 0; i < upg.Item1; i++)
                {
                    array[idx] = upg.Item2;
                    idx++;
                }
            }

            return array;
        });
    }
}
