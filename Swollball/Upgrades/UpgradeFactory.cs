using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public static class UpgradeFactory
    {
        /// <summary>
        /// Holds all the upgrade names
        /// This also corresponds with the image names
        /// </summary>
        public static class Names
        {
            public const string Tofu = "Tofu";
            public const string Apple = "Apple";
            public const string Brocolli = "Brocolli";
            public const string Milk = "Milk";
            public const string Bread = "Bread";
            public const string Bigger = "Bigger";
            public const string Bulwark = "Bulwark";
            public const string Feast = "Feast";

            public const string Bacon = "Bacon";
            public const string Calcify = "Calcify";
            public const string GET_BUFF = "GET BUFF";
            public const string Harden = "Harden";
            public const string Impulse = "Impulse";
            public const string Payday = "Payday";
            public const string Buffet = "Buffet";
            public const string Vanguard = "Vanguard";

            public const string Giant = "Giant";
            public const string Banana = "Banana";
            public const string Regrowth = "Regrowth";
            public const string BROcolli = "BROcolli";
            public const string Soy_Milk = "Soy Milk";
            public const string Rice = "Rice";
            public const string Yoga = "Yoga";
            public const string Reinforce = "Reinforce";
            public const string Bioshield = "Bioshield";
            public const string Inertia = "Inertia";

            public const string Ossify = "Ossify";
            public const string Ketones = "Ketones";
            public const string Wagyu = "Wagyu";
            public const string GET_SWOLL = "GET SWOLL";
            public const string Siphon = "Siphon";
            public const string Fortify = "Fortify";
            public const string Modelling = "Modelling";
        }

        private static Random Rng = new Random();

        public static int[] ShopSize = new int[] { 2, 3, 4, 5, 6 };
        public static int[] UpgradeTierCost = new int[] {1, 11, 15, 19, -1 /*No more upgrades*/};

        // TODO: Balance all the shops!
        private static List<Tuple<int, Func<IUpgrade>>> Tier1UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(18, () => new Damage(3, 3, Names.Tofu) as IUpgrade),
            Tuple.Create(18, () => new Armor(1, 3, Names.Apple) as IUpgrade),
            Tuple.Create(18, () => new Hp(10, 2, Names.Brocolli) as IUpgrade),
            Tuple.Create(18, () => new Size(15, 2, Names.Milk) as IUpgrade),
            Tuple.Create(18, () => new Speed(30, 2, Names.Bread) as IUpgrade),
            Tuple.Create(7, () => new SizeWhenHp(1, 3, Names.Bigger) as IUpgrade),
            Tuple.Create(7, () => new DamageWhenArmor(1, 4, Names.Bulwark) as IUpgrade),
            Tuple.Create(7, () => new HpWhenDamageDone(2, 4, Names.Feast) as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier2UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(12, () => new Damage(5, 4, Names.Bacon) as IUpgrade),
            Tuple.Create(12, () => new HpPerSize(2, 3, Names.Calcify) as IUpgrade),
            Tuple.Create(9, () => new SizePerSize(1, 6, Names.GET_BUFF) as IUpgrade),
            Tuple.Create(6, () => new ArmorWhenHit(1, 6, Names.Harden) as IUpgrade),
            Tuple.Create(6, () => new DamageWhenSpeed(1, 6, Names.Impulse) as IUpgrade),
            Tuple.Create(6, () => new CreditsWhenDamageDone(1, 6, Names.Payday) as IUpgrade),
            Tuple.Create(6, () => new HpPerDamageTaken(1, 6, Names.Buffet) as IUpgrade),
            Tuple.Create(5, () => new DamageWhenArmor(2, 6, Names.Vanguard) as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier3UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(10, () => new SizeWhenHp(2, 4, Names.Giant) as IUpgrade),
            Tuple.Create(10, () => new Armor(4, 5, Names.Banana) as IUpgrade),
            Tuple.Create(9, () => new HpPerSpeed(2, 5, Names.Regrowth) as IUpgrade),
            Tuple.Create(9, () => new Hp(40, 4, Names.BROcolli) as IUpgrade),
            Tuple.Create(9, () => new Size(35, 3, Names.Soy_Milk) as IUpgrade),
            Tuple.Create(9, () => new Speed(50, 3, Names.Rice) as IUpgrade),
            Tuple.Create(9, () => new SpeedPerSize(1, 6, Names.Yoga) as IUpgrade),
            Tuple.Create(5, () => new ArmorWhenHit(4, 10, Names.Reinforce) as IUpgrade),
            Tuple.Create(5, () => new ArmorWhenHp(1, 5, Names.Bioshield) as IUpgrade),
            Tuple.Create(4, () => new DamageWhenSpeed(3, 7, Names.Inertia) as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier4UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(6, () => new HpPerSize(6, 5, Names.Ossify) as IUpgrade),
            Tuple.Create(6, () => new ArmorPerArmor(3, 10, Names.Ketones) as IUpgrade),
            Tuple.Create(6, () => new Damage(20, 6, Names.Wagyu) as IUpgrade),
            Tuple.Create(4, () => new SizePerSize(4, 8, Names.GET_SWOLL) as IUpgrade),
            Tuple.Create(4, () => new HpWhenDamageDone(8, 9, Names.Siphon) as IUpgrade),
            Tuple.Create(3, () => new ArmorWhenHit(8, 10, Names.Fortify) as IUpgrade),
            Tuple.Create(3, () => new CreditWhenHp(1, 10, Names.Modelling) as IUpgrade),
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

        public static void FillShop(Dictionary<string, IUpgrade> currentUpgrades, int shopSize, int shopTier, bool replaceBlankCards)
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

            if (replaceBlankCards)
            {
                foreach (var card in currentUpgrades.Values)
                {
                    if (card == BlankUpgrade.Instance.First())
                    {
                        var rng = Rng.Next(cardGenerator.Count());
                        var generatedUpgrade = cardGenerator[rng]();
                        currentUpgrades[card.ServerId] = generatedUpgrade;
                    }
                }
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
