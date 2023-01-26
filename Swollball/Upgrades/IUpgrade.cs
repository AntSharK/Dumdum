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
        public int UpgradeAmount { get; set; }
        public string Description { get; }
        public string ServerId { get; }
        public int BorderColor { get; }
        public int FillColor { get; }
        public int Cost { get; }
        public HashSet<string> Tags { get; }
        public void PerformUpgrade(Player player);
        void BeforeUpgrade(Player player);
        void AfterUpgrade(Player player);
        void StartNextRound(Player player);
    }
}
