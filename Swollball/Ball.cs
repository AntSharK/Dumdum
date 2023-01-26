using Swollball.Upgrades;
using Swollball.Upgrades.Keystones;
using System.Runtime.Serialization;

namespace Swollball
{
    /// <summary>
    /// A self-contained class with all the data for a ball
    /// </summary>
    public class Ball
    {
        public string PlayerName { get; private set; }
        public int Hp { get; set; } = 100;
        public int Color { get; set; } = 0xFFFFFF;
        public int SizeMultiplier { get; set; } = 100;
        public int SpeedMultiplier { get; set; } = 100;
        public int Dmg { get; set; } = 10;
        public int Armor { get; set; } = 0;

        /// <summary>
        /// Gets the Persistent Upgrades to send down to the client
        /// </summary>
        public IEnumerable<IUpgrade> PersistentUpgradeData => this.UpgradeIndex[UpgradeTags.PERSISTENT];

        /// <summary>
        /// Operations modifying upgrades should be done using provided public methods
        /// </summary>
        private List<IUpgrade> Upgrades = new List<IUpgrade>();
        private Dictionary<string, List<IUpgrade>> UpgradeIndex = new Dictionary<string, List<IUpgrade>>();

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

        public Ball(string playerName)
        {
            this.PlayerName = playerName;
        }
    }
}