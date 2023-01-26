using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class BlankUpgrade : IUpgrade
    {
        public static IEnumerable<IUpgrade> Instance = new List<IUpgrade>() { new BlankUpgrade() };

        public string UpgradeName => $"";

        public string Description => $"";

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public int BorderColor { get; private set; } = 0;
        public int FillColor => 16777215;

        public int UpgradeAmount => 0;

        public int Cost => 0;

        public HashSet<string> Tags { get; set; } = new HashSet<string>();

        int IUpgrade.UpgradeAmount { get; set; } = 0;

        public void AfterUpgrade(Player player)
        {
            // Do nothing
        }

        public void BeforeUpgrade(Player player)
        {
            // Do nothing
        }

        public void PerformUpgrade(Player player)
        {
            // Do nothing
        }

        public void StartNextRound(Player player)
        {
            // Do nothing
        }
    }
}
