using Swollball.Upgrades;
using System.Runtime.Serialization;

namespace Swollball
{
    /// <summary>
    /// A self-contained class with all the data for a ball
    /// </summary>
    public class Ball
    {
        public string PlayerName { get; private set; }
        public int Hp { get; private set; } = 100;
        public int Color { get; set; } = 0xFFFFFF;
        public int SizeMultiplier { get; private set; } = 100;
        public int SpeedMultiplier { get; private set; } = 100;
        public int Dmg { get; private set; } = 10;
        public int Armor { get; private set; } = 0;

        /// <summary>
        /// Gets the Persistent Upgrades to send down to the client
        /// Listed as a property so that it's automatically serialized and sent to the client
        /// </summary>
        public IEnumerable<IUpgrade> PersistentUpgradeData => this.GetUpgradesByTag(UpgradeTags.PERSISTENT);

        /// <summary>
        /// Operations modifying upgrades should be done using provided public methods
        /// </summary>
        private List<IUpgrade> Upgrades = new List<IUpgrade>();
        private Dictionary<string, List<IUpgrade>> UpgradeIndex = new Dictionary<string, List<IUpgrade>>();

        public string UpgradeDisplayInfo => string.Join(',', this.Upgrades.Select(u => u.UpgradeName));

        /// <summary>
        /// Increases stats for the ball
        /// </summary>
        /// <param name="stat">The stat to increase - from Upgrade Tag</param>
        /// <param name="increaseAmount">The amount to increase</param>
        /// <param name="currentDepth">The depth of the current applied upgrade - to prevent infinite feedback loops</param>
        internal void IncreaseStat(string stat, int increaseAmount, int currentDepth = 0)
        {
            const int MAXDEPTH = 3;
            if (currentDepth > MAXDEPTH)
            {
                return;
            }

            string triggerTag;
            switch (stat)
            {
                case UpgradeTags.ARMORUPGRADE:
                    this.Armor += increaseAmount;
                    triggerTag = UpgradeTags.TRIGGERONARMORUPGRADE;
                    break;
                case UpgradeTags.DAMAGEUPGRADE:
                    this.Dmg += increaseAmount;
                    triggerTag = UpgradeTags.TRIGGERONDAMAGEUPGRADE;
                    break;
                case UpgradeTags.HPUPGRADE:
                    this.Hp += increaseAmount;
                    triggerTag = UpgradeTags.TRIGGERONHPUPGRADE;
                    break;
                case UpgradeTags.SIZEUPGRADE:
                    this.SizeMultiplier += increaseAmount;
                    triggerTag = UpgradeTags.TRIGGERONSIZEUPGRADE;
                    break;
                case UpgradeTags.SPEEDUPGRADE:
                    this.SpeedMultiplier += increaseAmount;
                    triggerTag = UpgradeTags.TRIGGERONSPEEDUPGRADE;
                    break;
                default:
                    return;
            }

            if (!this.UpgradeIndex.ContainsKey(triggerTag))
            {
                return;
            }

            if (increaseAmount > 0)
            {
                foreach(var upgradeToApply in this.UpgradeIndex[triggerTag])
                {
                    upgradeToApply.Trigger(this, triggerTag, increaseAmount, currentDepth + 1);
                }
            }
        }

        public void AddUpgrade(IUpgrade upgrade)
        {
            this.Upgrades.Add(upgrade);
            foreach (var tag in upgrade.Tags)
            {
                if (!UpgradeIndex.ContainsKey(tag))
                {
                    UpgradeIndex[tag] = new List<IUpgrade>();
                }

                this.UpgradeIndex[tag].Add(upgrade);
            }
        }

        public IEnumerable<IUpgrade> GetUpgradesByTag(string tag)
        {
            if (!this.UpgradeIndex.ContainsKey(tag))
            {
                return Enumerable.Empty<IUpgrade>();
            }

            return this.UpgradeIndex[tag];
        }

        public IUpgrade? FindUpgrade(string upgradeId)
        {
            return this.Upgrades.Where(k => k.ServerId == upgradeId).FirstOrDefault();
        }

        public bool RemoveUpgrade(IUpgrade upgrade)
        {
            foreach (var tag in upgrade.Tags)
            {
                this.UpgradeIndex[tag].Remove(upgrade);
            }

            return this.Upgrades.Remove(upgrade);
        }

        public Ball(string playerName)
        {
            this.PlayerName = playerName;
        }
    }
}