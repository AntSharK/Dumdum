using Common.Util;

namespace Octoprotecto
{
    public static class UpgradeFactory
    {
        // Luck multiplier should be higher for higher level upgrades
        // BaseRate is higher for low level upgrades
        private static (int luckMultiplier, int baseRate, Func<Upgrade<Octopus>> upgradeFunc)[] OctopusUpgrades =
        {
#pragma warning disable CS8603 // Possible null reference return.
            (1, 1000, () => null),
#pragma warning restore CS8603 // Possible null reference return.
            (5, 10, () => new OctopusTrackedUpgrade(OctopusTrackedUpgrade.UpgradeType.Integrate)),
            (1, 900, () => new OctopusTrackedUpgrade(OctopusTrackedUpgrade.UpgradeType.ArmorWhenHit)),
            (1, 500, () => new OctopusTrackedUpgrade(OctopusTrackedUpgrade.UpgradeType.PointsWhenHit))
        };

        private static (int luckMultiplier, int baseRate, Func<Upgrade<Weapon>> upgradeFunc)[] TentacleUpgrades =
        {
#pragma warning disable CS8603 // Possible null reference return.
            (1, 400, () => null),
#pragma warning restore CS8603 // Possible null reference return.
            (5, 10, () => new TentacleSpecialUpgrade(TentacleSpecialUpgrade.UpgradeType.Split)),
            (5, 10, () => new TentacleSpecialUpgrade(TentacleSpecialUpgrade.UpgradeType.Integrate)),
            (2, 200, () => new TentacleSpecialUpgrade(TentacleSpecialUpgrade.UpgradeType.Consume)),
            (3, 100, () => new TentacleSpecialUpgrade(TentacleSpecialUpgrade.UpgradeType.Momentum)),
            (4, 200, () => new TentacleSpecialUpgrade(TentacleSpecialUpgrade.UpgradeType.Propel)),
        };

        public static Upgrade<Octopus> GetBodyUpgrade(int luck)
        {
            return GetSingleInstance(luck, OctopusUpgrades);
        }

        public static Upgrade<Weapon> GetWeaponUpgrade(int luck)
        {
            return GetSingleInstance(luck, TentacleUpgrades);
        }

        private static T GetSingleInstance<T>(int luck, (int luckMultiplier, int baseRate, Func<T> generationFunc)[] functionGenerator)
        {
            var currentThreshold = 0;
            var idx = 0;
            var thresholdToFunctionMap = new (int threshold, Func<T> generationFunc)[functionGenerator.Length];
            foreach (var functionGen in functionGenerator)
            {
                currentThreshold += functionGen.baseRate + (luck * functionGen.luckMultiplier);
                thresholdToFunctionMap[idx] = (currentThreshold, functionGen.generationFunc);
                idx++;
            }

            var rng = Utils.Rng.Next(currentThreshold);
            foreach (var thresholdToFunction in thresholdToFunctionMap)
            {
                if (rng <= thresholdToFunction.threshold)
                {
                    return thresholdToFunction.generationFunc();
                }
            }

#pragma warning disable CS8603 // Possible null reference return.
            return default(T);
#pragma warning restore CS8603 // Possible null reference return.
        }
    }
}
