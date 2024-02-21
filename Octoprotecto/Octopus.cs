using System.Drawing;
using Common;
using Common.Util;

namespace Octoprotecto
{
    /// <summary>
    /// All public properties are serialized by SignalR
    /// </summary>
    public class Octopus : Player
    {
        public double DesiredX { get; set; }
        public double DesiredY { get; set; }
        public int Tint { get; set; }
        public double Speed { get; set; } = 0.3; // Expressed as distance covered per millisecond

        public Octopus(string name, string connectionId, string roomName) 
            : base(name, connectionId, roomName)
        {
        }

        internal void SetRandomLocation(Rectangle octopiMovementBounds)
        {
            this.DesiredX = Utils.Rng.Next(octopiMovementBounds.Left, octopiMovementBounds.Right);
            this.DesiredY = Utils.Rng.Next(octopiMovementBounds.Top, octopiMovementBounds.Bottom);
        }
    }
}
