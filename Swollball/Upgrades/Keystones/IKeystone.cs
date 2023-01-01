using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades.Keystones
{
    /// <summary>
    /// A keystone is an effect that acts on upgrades
    /// </summary>
    public interface IKeystone: IUpgrade
    {
        public new int UpgradeAmount { get; set; }
        void BeforeUpgrade(Ball ball);
        void AfterUpgrade(Ball ball);
    }
}
