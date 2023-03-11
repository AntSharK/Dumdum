namespace Swollball.Upgrades
{
    public class BlankUpgrade : IUpgrade
    {
        public static IEnumerable<IUpgrade> Instance { get; } = new List<IUpgrade>() { new BlankUpgrade() };

        public string UpgradeName => $"";

        public string Description => $"";

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public int BorderColor { get; private set; } = 0;
        public int FillColor => UpgradeColors.WHITE;

        public int UpgradeAmount { get; private set; } = 0;

        public int Duration { get; set; } = -1;

        public int Cost => 0;

        public HashSet<string> Tags { get; set; } = new HashSet<string>();

        int IUpgrade.UpgradeAmount { get; set; } = 0;

        public void PerformUpgrade(Player player)
        {
            // Do nothing
        }

        public void StartNextRound(Player player)
        {
            // Do nothing
        }

        public void RemoveUpgrade(Player player)
        {
            // Do nothing
        }

        public void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            // Does nothing
        }

        public void AnotherUpgradePurchased(IUpgrade upgrade)
        {
            // Does nothing
        }
    }
}
