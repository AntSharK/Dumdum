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
        public static int[] UpgradeTierCost = new int[] {1, 11, 15, 19, -1 /*No more upgrades*/};

        // TODO: Balance all the shops!
        private static List<Tuple<int, Func<IUpgrade>>> Tier1UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(18, () => new Damage(3, 3, "Tofu") as IUpgrade),
            Tuple.Create(18, () => new Armor(1, 3, "Apple") as IUpgrade),
            Tuple.Create(18, () => new Hp(10, 2, "Brocolli") as IUpgrade),
            Tuple.Create(18, () => new Size(15, 2, "Milk") as IUpgrade),
            Tuple.Create(18, () => new Speed(30, 2, "Bread") as IUpgrade),
            Tuple.Create(7, () => new SizeWhenHp(1, 3, "Bigger") as IUpgrade),
            Tuple.Create(7, () => new DamageWhenArmor(1, 4, "Bulwark") as IUpgrade),
            Tuple.Create(7, () => new HpWhenDamageDone(2, 4, "Feast") as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier2UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(12, () => new Damage(5, 4, "Bacon") as IUpgrade),
            Tuple.Create(12, () => new HpPerSize(2, 3, "Calcify") as IUpgrade),
            Tuple.Create(9, () => new SizePerSize(1, 6, "GET BUFF") as IUpgrade),
            Tuple.Create(6, () => new ArmorWhenHit(1, 6, "Harden") as IUpgrade),
            Tuple.Create(6, () => new DamageWhenSpeed(1, 6, "Impulse") as IUpgrade),
            Tuple.Create(6, () => new CreditsWhenDamageDone(1, 6, "Payday") as IUpgrade),
            Tuple.Create(6, () => new HpPerDamageTaken(1, 6, "Buffet") as IUpgrade),
            Tuple.Create(5, () => new DamageWhenArmor(2, 6, "Vanguard") as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier3UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(10, () => new SizeWhenHp(2, 4, "Giant") as IUpgrade),
            Tuple.Create(10, () => new Armor(4, 5, "Banana") as IUpgrade),
            Tuple.Create(9, () => new HpPerSpeed(2, 5, "+Regrowth") as IUpgrade),
            Tuple.Create(9, () => new Hp(40, 4, "BROcolli") as IUpgrade),
            Tuple.Create(9, () => new Size(35, 3, "Soy Milk") as IUpgrade),
            Tuple.Create(9, () => new Speed(50, 3, "Rice") as IUpgrade),
            Tuple.Create(9, () => new SpeedPerSize(1, 6, "Yoga") as IUpgrade),
            Tuple.Create(5, () => new ArmorWhenHit(4, 10, "Reinforce") as IUpgrade),
            Tuple.Create(5, () => new ArmorWhenHp(1, 5, "Bioshield") as IUpgrade),
            Tuple.Create(4, () => new DamageWhenSpeed(3, 7, "Inertia") as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier4UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(6, () => new HpPerSize(6, 5, "Ossify") as IUpgrade),
            Tuple.Create(6, () => new ArmorPerArmor(3, 10, "Ketones") as IUpgrade),
            Tuple.Create(6, () => new Damage(20, 6, "Wagyu") as IUpgrade),
            Tuple.Create(4, () => new SizePerSize(4, 8, "GET SWOLL") as IUpgrade),
            Tuple.Create(4, () => new HpWhenDamageDone(8, 9, "Siphon") as IUpgrade),
            Tuple.Create(3, () => new ArmorWhenHit(8, 10, "Fortify") as IUpgrade),
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
            Tuple.Create(1, () => new DamageWhenSpeed(1, 1, "TestImpulse") as IUpgrade),
            Tuple.Create(1, () => new Speed(30, 1, "TestUpgrade") as IUpgrade),
            Tuple.Create(1, () => new ArmorWhenHit(1, 1, "TestHarden") as IUpgrade),
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
