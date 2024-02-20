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
