using Common.Util;

namespace Octoprotecto
{
    public static class UpgradeFactory
    {
        // Luck multiplier should be higher for higher level upgrades
        // BaseRate is higher for low level upgrades
        private static (int luckMultiplier, int baseRate, Func<Upgrade<Octopus>> upgradeFunc)[] OctopusUpgrades =
        {
            (1, 900, () => new OctopusTrackedUpgrade(OctopusTrackedUpgrade.UpgradeType.ArmorWhenHit)),
            (1, 500, () => new OctopusTrackedUpgrade(OctopusTrackedUpgrade.UpgradeType.PointsWhenHit))
        };

        private static (int luckMultiplier, int baseRate, Func<Upgrade<Weapon>> upgradeFunc)[] TentacleUpgrades =
        {
            (5, 10, () => new TentacleSpecialUpgrade(TentacleSpecialUpgrade.UpgradeType.Split)),
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
                currentThreshold += functionGen.baseRate * luck * functionGen.luckMultiplier;
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

            return default(T);
        }
    }
}
