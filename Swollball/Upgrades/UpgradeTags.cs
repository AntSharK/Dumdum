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

    /// <summary>
    /// Colors for cards
    /// </summary>
    public static class UpgradeColors
    {
        // Dark colors for borders
        public const int BLACK = 0;
        public const int RED = 660808; // 0x660808
        public const int BROWN = 5712390; // 0x572A06
        public const int GREEN = 21530; // 0x00541A
        public const int BLUE = 802393; // 0x0C3E59
        public const int PURPLE = 2690117; // 0x290C45

        // Light colors for background
        public const int ROSE = 15584203; // 0xEDCBCB
        public const int LAVENDER = 14599890; // 0xDEC6D2
        public const int PERIWINKLE = 14014199; // 0xD5D6F7
        public const int SKYBLUE = 14873335; // 0xE2F2F7
        public const int AQUA = 14678006; // 0xDFF7F6
        public const int LIGHTGREEN = 15794158; // 0xF0FFEE
        public const int LIME = 16383963; // 0xF9FFDB
        public const int LIGHTGRAY = 12763842; // 0xC2C2C2
        public const int WHITE = 16777215; // 0xFFFFFF
    }
}
