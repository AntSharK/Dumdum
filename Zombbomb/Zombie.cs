using Common;

namespace Zombbomb
{
    public class Zombie: Player
    {
        public double LocationX;
        public double LocationY;
        public int Color;
        public bool IsDead = false;

        public Zombie(string name, string connectionId, string roomName)
            : base(name, connectionId, roomName)
        {
        }

        internal void KillZombie()
        {
            this.IsDead = true;

            // Set LocationX and LocationY to negative values to denote that this player is dead
            this.LocationX = -2000;
            this.LocationY = -2000;
        }
    }
}
