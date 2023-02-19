namespace Swollball.Upgrades
{
    // Keystones are persistent upgrades
    public abstract class BasePersistentUpgrade : BaseUpgrade
    {
        public BasePersistentUpgrade(int amount, int cost, string name, int duration) :
            base(amount, cost, name)
        {
            this.Duration = duration;
            this.Tags.Add(UpgradeTags.PERSISTENT);

            if (duration > 0)
            {
                this.Tags.Add(UpgradeTags.TEMPORARY);
            }
        }
    }
}
