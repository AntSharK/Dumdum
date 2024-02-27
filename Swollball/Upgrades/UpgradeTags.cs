using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    /// <summary>
    /// Tags that the client needs to know about
    /// </summary>
    public static class UpgradeTags
    {
        // For tags that the client needs to implement logic for
        public const string PERSISTENT = "Persistent";
        public const string LIFESTEAL = "Lifesteal";
        public const string REINFORCE = "Reinforce";

        // For tags which modify server-side behavior
        public const string ONTURNSTART = "Reward";
        public const string TEMPORARY = "Temporary";
        public const string ENHANCEMENT = "Enhancement";

        // For tags to denote what is changed
        public const string ARMORUPGRADE = "ArmorUpg";
        public const string SPEEDUPGRADE = "SpeedUpg";
        public const string DAMAGEUPGRADE = "DamageUpg";
        public const string SIZEUPGRADE = "SizeUpg";
        public const string HPUPGRADE = "HpUpg";
        public const string CASHUPGRADE = "CashUpg";

        // For tags to denote that this upgrade fires when a stat is changed
        public const string TRIGGERONARMORUPGRADE = "TriggerOnArmorUpg";
        public const string TRIGGERONSPEEDUPGRADE = "TriggerOnSpeedUpg";
        public const string TRIGGERONDAMAGEUPGRADE = "TriggerOnDamageUpg";
        public const string TRIGGERONSIZEUPGRADE = "TriggerOnSizeUpg";
        public const string TRIGGERONHPUPGRADE = "TriggerOnHpUpg";
    }
}
