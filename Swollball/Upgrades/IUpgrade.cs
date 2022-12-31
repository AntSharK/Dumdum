using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    /// <summary>
    /// Many properties are also for sending metadata down to the client
    /// </summary>
    public interface IUpgrade
    {
        public string UpgradeName { get; }
        public int UpgradeAmount { get; }
        public string Description { get; }
        public string ServerId { get; }
        public int BorderColor { get; }
        public void PerformUpgrade(Ball ball);
    }
}
