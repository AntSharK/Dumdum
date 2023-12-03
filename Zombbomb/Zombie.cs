using Common;

namespace Zombbomb
{
    public class Zombie: Player
    {
        public double LocationX;
        public double LocationY;
        public int Color;

        public Zombie(string name, string connectionId, string roomName)
            : base(name, connectionId, roomName)
        {
        }
    }
}
