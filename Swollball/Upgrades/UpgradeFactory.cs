using Common.Util;

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
            public const string RetirementPlan = "401k";

            public const string Ossify = "Ossify";
            public const string Ketones = "Ketones";
            public const string Wagyu = "Wagyu";
            public const string GET_SWOLL = "GET SWOLL";
            public const string Siphon = "Siphon";
            public const string Fortify = "Fortify";
            public const string Modelling = "Modelling";
            public const string Overcharge = "Overcharge";
            public const string UberBeet = "UberBeet";
        }

        private static Random Rng = new Random();

        public static int[] ShopSize = new int[] { 2, 3, 4, 5, 6 };
        public static int[] UpgradeTierCost = new int[] {1, 11, 15, 19, -1 /*No more upgrades*/};

        // TODO: Balance all the shops!
        private static List<Tuple<int, Func<IUpgrade>>> Tier1UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(18, () => new Damage(3, 4, Names.Tofu) as IUpgrade),
            Tuple.Create(18, () => new Armor(1, 3, Names.Apple) as IUpgrade),
            Tuple.Create(18, () => new Hp(10, 2, Names.Brocolli) as IUpgrade),
            Tuple.Create(18, () => new Size(15, 2, Names.Milk) as IUpgrade),
            Tuple.Create(18, () => new Speed(30, 2, Names.Bread) as IUpgrade),
            Tuple.Create(9, () => new SizeWhenHp(1, 3, Names.Bigger, 5) as IUpgrade),
            Tuple.Create(9, () => new DamageWhenArmor(1, 4, Names.Bulwark, 3) as IUpgrade),
            Tuple.Create(9, () => new HpWhenDamageDone(2, 5, Names.Feast, 4) as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier2UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(15, () => new Damage(4, 4, Names.Bacon) as IUpgrade),
            Tuple.Create(15, () => new HpPerSize(2, 3, Names.Calcify) as IUpgrade),
            Tuple.Create(15, () => new SizePerSize(1, 6, Names.GET_BUFF) as IUpgrade),
            Tuple.Create(8, () => new ArmorWhenHit(1, 6, Names.Harden, 3) as IUpgrade),
            Tuple.Create(8, () => new DamageWhenSpeed(1, 6, Names.Impulse, 5) as IUpgrade),
            Tuple.Create(8, () => new CreditsWhenDamageDone(1, 6, Names.Payday, -1 /*Permanent*/) as IUpgrade),
            Tuple.Create(8, () => new HpPerDamageTaken(1, 6, Names.Buffet) as IUpgrade),
            Tuple.Create(8, () => new DamageWhenArmor(2, 6, Names.Vanguard, 3) as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier3UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(7, () => new SizeWhenHp(2, 4, Names.Giant, 5) as IUpgrade),
            Tuple.Create(12, () => new Armor(4, 5, Names.Banana) as IUpgrade),
            Tuple.Create(7, () => new HpPerSpeed(2, 5, Names.Regrowth) as IUpgrade),
            Tuple.Create(12, () => new Hp(40, 4, Names.BROcolli) as IUpgrade),
            Tuple.Create(12, () => new Size(35, 3, Names.Soy_Milk) as IUpgrade),
            Tuple.Create(12, () => new Speed(50, 3, Names.Rice) as IUpgrade),
            Tuple.Create(7, () => new SpeedPerSize(1, 6, Names.Yoga) as IUpgrade),
            Tuple.Create(7, () => new ArmorWhenHit(4, 10, Names.Reinforce, 2) as IUpgrade),
            Tuple.Create(7, () => new ArmorWhenHp(1, 5, Names.Bioshield, 3) as IUpgrade),
            Tuple.Create(7, () => new DamageWhenSpeed(3, 7, Names.Inertia, 5) as IUpgrade),
            Tuple.Create(7, () => new HpWhenCreditSpent(2, 8, Names.RetirementPlan, 4) as IUpgrade),
        };

        private static List<Tuple<int, Func<IUpgrade>>> Tier4UpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(6, () => new HpPerSize(6, 5, Names.Ossify) as IUpgrade),
            Tuple.Create(6, () => new ArmorPerArmor(3, 10, Names.Ketones) as IUpgrade),
            Tuple.Create(9, () => new Damage(20, 6, Names.Wagyu) as IUpgrade),
            Tuple.Create(6, () => new SizePerSize(4, 8, Names.GET_SWOLL) as IUpgrade),
            Tuple.Create(6, () => new HpWhenDamageDone(7, 9, Names.Siphon, 3) as IUpgrade),
            Tuple.Create(5, () => new ArmorWhenHit(8, 10, Names.Fortify, 2) as IUpgrade),
            Tuple.Create(5, () => new SpeedEnhancement(2, 6, Names.Overcharge, 4) as IUpgrade),
            Tuple.Create(5, () => new CreditWhenHp(1, 10, Names.Modelling, 3) as IUpgrade),
            Tuple.Create(9, () => new Hp(100, 6, Names.UberBeet) as IUpgrade),
        };
        
        private static Lazy<Func<IUpgrade>[]> Tier1Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            return Utils.CollateOdds(Tier1UpgradeOdds);
        });
        private static Lazy<Func<IUpgrade>[]> Tier2Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            return Utils.CollateOdds(Tier1UpgradeOdds, Tier2UpgradeOdds);
        });
        private static Lazy<Func<IUpgrade>[]> Tier3Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            return Utils.CollateOdds(Tier1UpgradeOdds, Tier2UpgradeOdds, Tier3UpgradeOdds);
        });
        private static Lazy<Func<IUpgrade>[]> Tier4Upgrades = new Lazy<Func<IUpgrade>[]>(() =>
        {
            return Utils.CollateOdds(Tier1UpgradeOdds, Tier2UpgradeOdds, Tier3UpgradeOdds, Tier4UpgradeOdds);
        });

        public static Dictionary<string, IUpgrade> FillShop(Dictionary<string, IUpgrade> currentUpgrades, int shopSize, int shopTier, bool replaceBlankCards)
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
                var replacementDeck = new Dictionary<string, IUpgrade>();
                foreach (var card in currentUpgrades.Values)
                {
                    if (card.UpgradeName == string.Empty)
                    {
                        var rng = Rng.Next(cardGenerator.Count());
                        var generatedUpgrade = cardGenerator[rng]();
                        replacementDeck[generatedUpgrade.ServerId] = generatedUpgrade;
                    }
                    else
                    {
                        replacementDeck[card.ServerId] = card;
                    }
                }

                return replacementDeck;
            }

            return currentUpgrades;
        }

        // Test - contains every single upgrade with cost 1 duration 1
        private static List<Tuple<int, Func<IUpgrade>>> TestUpgradeOdds = new List<Tuple<int, Func<IUpgrade>>>()
        {
            Tuple.Create(1, () => new Armor(1, 1, "Armor") as IUpgrade),
            Tuple.Create(1, () => new Damage(1, 1, "Damage") as IUpgrade),
            Tuple.Create(1, () => new Hp(10, 1, "Hp") as IUpgrade),
            Tuple.Create(1, () => new Size(10, 1, "Size") as IUpgrade),
            Tuple.Create(1, () => new Speed(10, 1, "Speed") as IUpgrade),

            Tuple.Create(1, () => new ArmorWhenHit(1, 1, "ArmorWhenHit", 1) as IUpgrade),
            Tuple.Create(1, () => new ArmorWhenHp(1, 1, "ArmorWhenHp", 1) as IUpgrade),
            Tuple.Create(1, () => new CreditsWhenDamageDone(1, 1, "CreditsWhenDamageDone", 1) as IUpgrade),
            Tuple.Create(1, () => new CreditWhenHp(1, 1, "CreditWhenHp", 1) as IUpgrade),
            Tuple.Create(1, () => new DamageWhenArmor(1, 1, "DamageWhenArmor", 1) as IUpgrade),
            Tuple.Create(1, () => new DamageWhenSpeed(1, 1, "DamageWhenSpeed", 1) as IUpgrade),
            Tuple.Create(1, () => new HpWhenDamageDone(1, 1, "HpWhenDamageDone", 1) as IUpgrade),
            Tuple.Create(1, () => new SizeWhenHp(1, 1, "SizeWhenHp", 1) as IUpgrade),
            Tuple.Create(1, () => new DamageWhenSpeed(1, 1, "DamageWhenSpeed", 1) as IUpgrade),

            Tuple.Create(1, () => new ArmorPerArmor(1, 1, "ArmorPerArmor") as IUpgrade),
            Tuple.Create(1, () => new HpPerDamageTaken(1, 1, "HpPerDamageTaken") as IUpgrade),
            Tuple.Create(1, () => new HpPerSize(1, 1, "HpPerSize") as IUpgrade),
            Tuple.Create(1, () => new HpPerSpeed(1, 1, "HpPerSpeed") as IUpgrade),
            Tuple.Create(1, () => new SizePerSize(1, 1, "SizePerSize") as IUpgrade),
            Tuple.Create(1, () => new SpeedPerSize(1, 1, "SpeedPerSize") as IUpgrade),
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
