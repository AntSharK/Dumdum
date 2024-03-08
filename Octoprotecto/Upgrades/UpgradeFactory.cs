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

        public static Upgrade<Octopus> GetBodyUpgrade(int luck)
        {
            var currentThreshold = 0;
            var idx = 0;
            var thresholdToUpgradeMap = new (int threshold, Func<Upgrade<Octopus>> upgradeFunc)[OctopusUpgrades.Length];
            foreach (var octopusUpgrade in OctopusUpgrades)
            {
                currentThreshold += octopusUpgrade.baseRate * luck * octopusUpgrade.luckMultiplier;
                thresholdToUpgradeMap[idx] = (currentThreshold, octopusUpgrade.upgradeFunc);
                idx++;
            }

            var rng = Utils.Rng.Next(currentThreshold);
            foreach (var thresholdToUpgrade in thresholdToUpgradeMap)
            {
                if (rng <= thresholdToUpgrade.threshold)
                {
                    return thresholdToUpgrade.upgradeFunc();
                }
            }

            return null;
        }
    }
}
