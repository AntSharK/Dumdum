using Swollball.Upgrades;

namespace Swollball
{
    /// <summary>
    /// For the purpose of serializing costs and credits down to the client
    /// </summary>
    public class EconomyData
    {
        public int CreditsLeft { get; set; } = 9;
        public int MaxCredits { get; set; } = 9;
        public int ShopSize { get; set; } = UpgradeFactory.ShopSize[1];
        public int ShopTier { get; set; } = 1;
        public int UpgradeTierCost { get; set; } = UpgradeFactory.UpgradeTierCost[1];
    }
}
