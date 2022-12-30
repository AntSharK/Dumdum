using Swollball.Upgrades;
using Swollball.Upgrades.Keystones;

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
        public float SizeMultiplier { get; set; } = 1;
        public float SpeedMultiplier { get; set; } = 1;
        public int Dmg { get; set; } = 10;
        public int Armor { get; set; } = 0;

        public List<IUpgrade> Upgrades { get; set; } = new List<IUpgrade>();

        public List<IKeystone> Keystones { get; set; } = new List<IKeystone>();

        public Ball(string playerName)
        {
            this.PlayerName = playerName;
        }
    }
}