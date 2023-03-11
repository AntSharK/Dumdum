namespace Swollball.Upgrades
{
    /// <summary>
    /// Many properties are also for sending metadata down to the client
    /// </summary>
    public interface IUpgrade
    {
        public string UpgradeName { get; }
        public int UpgradeAmount { get; set; }
        public string Description { get; }
        public string ServerId { get; }
        public int BorderColor { get; }
        public int FillColor { get; }
        public int Cost { get; }
        public int Duration { get; set; }
        public HashSet<string> Tags { get; }

        /// <summary>
        /// Applies before an upgrade is applied
        /// </summary>
        void PerformUpgrade(Player player);

        /// <summary>
        /// Action performed when the upgrade is removed
        /// </summary>
        void RemoveUpgrade(Player player);

        /// <summary>
        /// Action performed when another upgrade is purchased - only for ENHANCEMENT tagged upgrades
        /// </summary>
        void AnotherUpgradePurchased(IUpgrade upgrade);

        /// <summary>
        /// Action performed when an upgrade is triggered from an increase in stats
        /// </summary>
        /// <param name="ball">The ball which has a stat increase</param>
        /// <param name="increasedStat">The stat which was increased</param>
        /// <param name="triggerStatIncrease">The amount of the stat increase</param>
        /// <param name="triggerUpgradeDepth">The depth of the call to increase stats</param>
        void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth);

        /// <summary>
        /// Applies just before the next round begins - when new credits are issued
        /// </summary>
        void StartNextRound(Player player);
    }
}
