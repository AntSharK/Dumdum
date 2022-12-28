using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    internal class BlankUpgrade : IUpgrade
    {
        public string UpgradeName => $"";

        public string Description => $"";

        public string ServerId { get; private set; } = Guid.NewGuid().ToString();

        public int BorderColor { get; private set; } = 16777215;

        public void PerformUpgrade(Ball ball)
        {
            // Do nothing
        }
    }
}
