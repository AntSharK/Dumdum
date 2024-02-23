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
        public double Speed { get; set; } = 0.1497; // Expressed as distance covered per millisecond
        public int MaxHitPoints { get; set; } = 998;
        public int Points { get; set; } = 20;
        public int TotalDeaths { get; set; } = 0;
        public bool IsActive { get; set; } = true;

        public Octopus(string name, string connectionId, string roomName) 
            : base(name, connectionId, roomName)
        {
        }

        internal void SetRandomLocation(Rectangle octopiMovementBounds)
        {
            this.DesiredX = Utils.Rng.Next(octopiMovementBounds.Left, octopiMovementBounds.Right);
            this.DesiredY = Utils.Rng.Next(octopiMovementBounds.Top, octopiMovementBounds.Bottom);
        }

        internal int GetRespawnCost()
        {
            return 10 + this.TotalDeaths * 5;
        }
    }
}
