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
        public static int Never(Player p)
        {
            return -1;
        }

        public static int Sometimes(Player p)
        {
            return 10;
        }

        public static int Always(Player p)
        {
            return 99;
        }

        public static int WhenRich(Player p)
        {
            return p.Economy.MaxCredits - p.Economy.CreditsLeft;
        }
    }
}
