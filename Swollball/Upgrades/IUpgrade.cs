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
        public int Duration { get; set; }
        public HashSet<string> Tags { get; }

        /// <summary>
        /// Applies before an upgrade is applied
        /// </summary>
        void PerformUpgrade(Player player);

        /// <summary>
        /// Action performed when the upgrade is removed
        /// </summary>
        void RemoveUpgrade(Player player);

        /// <summary>
        /// Action performed before an upgrade is applied
        /// Can be used to hold values about pre-upgrade stats
        /// </summary>
        void BeforeUpgrade(Player player);

        /// <summary>
        /// Applies after an upgrade is applied
        /// This is applied in order - so upgrades bought earlier can modify stats for later upgrades
        /// </summary>
        void AfterUpgrade(Player player);

        /// <summary>
        /// Applies just before the next round begins - when new credits are issued
        /// </summary>
        void StartNextRound(Player player);
    }
}
