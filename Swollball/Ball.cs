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
        public IEnumerable<IUpgrade> PersistentUpgradeData
        {
            get
            {
                return this.Upgrades.Where(upgrade => upgrade.Tags.Contains(UpgradeTags.PERSISTENT));
            }
        }

        [System.Text.Json.Serialization.JsonIgnore]
        public List<IUpgrade> Upgrades { get; set; } = new List<IUpgrade>();

        public Ball(string playerName)
        {
            this.PlayerName = playerName;
        }
    }
}