using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball
{
    /// <summary>
    /// Make sure the properties match up with client-side properties
    /// SignalR will handle serialization automatically
    /// </summary>
    public class RoundEvent
    {
        public string AttackerId { get; set; }
        public string ReceiverId { get; set; }
        public int DamageDone { get; set; }
    }
}
