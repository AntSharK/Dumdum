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

        public int BorderColor { get; private set; } = 16777215;

        public int UpgradeAmount => 0;

        public void PerformUpgrade(Ball ball)
        {
            // Do nothing
        }
    }
}
