using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    // Tags that the client needs to know about
    public static class UpgradeTags
    {
        // For tags that the client needs to implement logic for
        public const string PERSISTENT = "Persistent";
        public const string LIFESTEAL = "Lifesteal";
        public const string REINFORCE = "Reinforce";

        // For tags which modify server-side behavior
        public const string UPGRADEMODIFIER = "Modifier";
        public const string ONTURNSTART = "Reward";
    }
}
