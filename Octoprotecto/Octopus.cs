using System.Drawing;
using Common;
using Common.Util;

namespace Octoprotecto
{
    public class Octopus : Player
    {
        public double LocationX;
        public double LocationY;
        public int Color;
        public double Speed = 0.3; // Expressed as distance covered per millisecond

        public Octopus(string name, string connectionId, string roomName) 
            : base(name, connectionId, roomName)
        {
        }

        internal void SetRandomLocation(Rectangle octopiMovementBounds)
        {
            this.LocationX = Utils.Rng.Next(octopiMovementBounds.Left, octopiMovementBounds.Right);
            this.LocationY = Utils.Rng.Next(octopiMovementBounds.Top, octopiMovementBounds.Bottom);
        }
    }
}
