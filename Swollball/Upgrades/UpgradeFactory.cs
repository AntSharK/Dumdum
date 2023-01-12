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

        public static int[] ShopSize = new int[] { 2, 3, 4, 5, 6 };
        public static int[] UpgradeTierCost = new int[] {1, 15, 18, 21, -1 /*No more upgrades*/};

        // TODO: Balance all the shops!
        private static List<Tuple<int, Func<IUpgrade>>> Tier1UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(18, () => new Damage(3, 3, "Tofu") as IUpgrade),
            Tuple.Create(18, () => new Armor(1, 3, "Apple") as IUpgrade),
            Tuple.Create(18, () => new Hp(10, 2, "Brocolli") as IUpgrade),
            Tuple.Create(18, () => new Size(15, 2, "Milk") as IUpgrade),
            Tuple.Create(18, () => new Speed(30, 2, "Bread") as IUpgrade),
            Tuple.Create(14, () => new Giant(1, 3) as IUpgrade),
            Tuple.Create(14, () => new Bulwark(1, 4) as IUpgrade),
            Tuple.Create(14, () => new Feast(2, 4) as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier2UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(12, () => new Damage(5, 4, "Bacon") as IUpgrade),
            Tuple.Create(12, () => new Armor(4, 5, "Banana") as IUpgrade),
            Tuple.Create(12, () => new Inertia(2, 3, "+Inertia") as IUpgrade),
            Tuple.Create(10, () => new Harden(1, 6) as IUpgrade),
            Tuple.Create(10, () => new Giant(2, 4) as IUpgrade),
            Tuple.Create(10, () => new Impulse(1, 6) as IUpgrade),
            Tuple.Create(10, () => new Payday(1, 6) as IUpgrade),
            Tuple.Create(10, () => new Cover(1, 6, "Buffet") as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier3UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(8, () => new Regrowth(2, 5, "+Regrowth") as IUpgrade),
            Tuple.Create(8, () => new Hp(40, 4, "BROcolli") as IUpgrade),
            Tuple.Create(8, () => new Size(35, 3, "Soy Milk") as IUpgrade),
            Tuple.Create(8, () => new Speed(50, 3, "Rice") as IUpgrade),
            Tuple.Create(8, () => new Furious(1, 6, "Yoga") as IUpgrade),
            Tuple.Create(8, () => new Bloat(1, 7, "GET SWOLL") as IUpgrade),
            Tuple.Create(8, () => new Bulwark(3, 6) as IUpgrade),
            Tuple.Create(8, () => new Harden(4, 10) as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier4UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(6, () => new Inertia(6, 5, "++Inertia") as IUpgrade),
            Tuple.Create(6, () => new Tech(2, 10, "Ketones") as IUpgrade),
            Tuple.Create(6, () => new Feast(8, 9) as IUpgrade),
            Tuple.Create(6, () => new Damage(20, 6, "Wagyu") as IUpgrade),
        };
        
        private static Lazy<Func<IUpgrade>[]> Tier1Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            return GetUpgrades(Tier1UpgradeOdds);
        });
        private static Lazy<Func<IUpgrade>[]> Tier2Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            return GetUpgrades(Tier1UpgradeOdds, Tier2UpgradeOdds);
        });
        private static Lazy<Func<IUpgrade>[]> Tier3Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            return GetUpgrades(Tier1UpgradeOdds, Tier2UpgradeOdds, Tier3UpgradeOdds);
        });
        private static Lazy<Func<IUpgrade>[]> Tier4Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            return GetUpgrades(Tier1UpgradeOdds, Tier2UpgradeOdds, Tier3UpgradeOdds, Tier4UpgradeOdds);
        });

        private static Func<IUpgrade>[] GetUpgrades(params List<Tuple<int, Func<IUpgrade>>>[] upgradeOddsList)
        {
            var totalSize = 0;
            foreach (var upgradeOdds in upgradeOddsList)
            {
                foreach (var upg in upgradeOdds)
                {
                    totalSize += upg.Item1;
                }
            }

            var array = new Func<IUpgrade>[totalSize];
            var idx = 0;
            foreach (var upgradeOdds in upgradeOddsList)
            {
                foreach (var upg in upgradeOdds)
                {
                    for (var i = 0; i < upg.Item1; i++)
                    {
                        array[idx] = upg.Item2;
                        idx++;
                    }
                }
            }

            return array;
        }

        public static void FillShop(Dictionary<string, IUpgrade> currentUpgrades, int shopSize, int shopTier)
        {
            Func<IUpgrade>[] cardGenerator;
            switch (shopTier)
            {
                case 1:
                    cardGenerator = Tier1Upgrades.Value;
                    break;
                case 2:
                    cardGenerator = Tier2Upgrades.Value;
                    break;
                case 3:
                    cardGenerator = Tier3Upgrades.Value;
                    break;
                case 4:
                    cardGenerator = Tier4Upgrades.Value;
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
            Tuple.Create(1, () => new Speed(30, 1, "TestUpgrade") as IUpgrade),
            Tuple.Create(1, () => new Harden(1, 1) as IUpgrade),
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
