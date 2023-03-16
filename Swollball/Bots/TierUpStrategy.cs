using Swollball.PlayerData;
using Swollball.Upgrades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    public static class TierUpStrategy
    {
        public static int Never(SwollballPlayer p)
        {
            return -1;
        }

        public static int Sometimes(SwollballPlayer p)
        {
            return 3;
        }

        public static int Always(SwollballPlayer p)
        {
            return 99;
        }

        public static int WhenRich(SwollballPlayer p)
        {
            return p.Economy.MaxCredits - p.Economy.CreditsLeft;
        }
    }
}
