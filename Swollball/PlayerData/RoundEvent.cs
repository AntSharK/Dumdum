using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.PlayerData
{
    /// <summary>
    /// Make sure the properties match up with client-side properties
    /// SignalR will handle serialization automatically
    /// 
    /// Note that certain damage numbers indicate something happening
    /// </summary>
    public class RoundEvent
    {
        public const string KILL = "KILL";
        public const string HEALTH = "HEALTH";
        public const string DAMAGE = "DAMAGE";

        public string EventName { get; set; } = string.Empty;
        public string AttackerId { get; set; } = string.Empty;
        public string ReceiverId { get; set; } = string.Empty;
        public double EventNumber { get; set; }

#if DEBUG
        // For easier debugging, override tostring
        public override string ToString()
        {
            return EventName + " - " + AttackerId + " - " + ReceiverId + " " + EventNumber;
        }
#endif
    }
}
