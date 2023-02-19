namespace Swollball.Upgrades
{
    public abstract class BaseUpgrade : IUpgrade
    {
        public string UpgradeName { get; set; }

        public abstract string Description { get; }

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public abstract int BorderColor { get; }

        public virtual int FillColor { get; } = UpgradeColors.WHITE;

        public int Cost { get; }

        public int UpgradeAmount { get; set; }

        public HashSet<string> Tags { get; set; } = new HashSet<string>();

        public int Duration { get; set; } = -1;

        public BaseUpgrade(int amount, int cost, string name)
        {
            this.UpgradeAmount = amount;
            this.Cost = cost;
            this.UpgradeName = name;
        }

        public virtual void PerformUpgrade(Player player)
        {
            player.Ball.AddUpgrade(this);
        }

        public virtual void RemoveUpgrade(Player player)
        {
            // Do nothing - does not involve selling upgrade
        }

        public virtual void StartNextRound(Player player)
        {
            // Does nothing
        }

        public virtual void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            // Does nothing
        }
    }
}
