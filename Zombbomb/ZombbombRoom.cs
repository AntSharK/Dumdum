using System.Drawing;
using Common;

namespace Zombbomb
{
    /// <summary>
    /// The Zombbomb room also contains data on the room owner, i.e. the player controlling the main screen
    /// </summary>
    public class ZombbombRoom : GameRoom<Zombie>
    {
        public RoomState State { get; internal set; } = RoomState.SettingUp;

        public Rectangle ZombieBounds = new Rectangle(0, 0, 1400, 200); // Note that this should mirror the game width on the client-side

        public ZombbombRoom(string roomId, string connectionId)
            : base(roomId, connectionId)
        {
        }

        protected override Zombie CreatePlayerInternal(string playerName, string connectionId)
        {
            return new Zombie(playerName, connectionId, this.RoomId);
        }

        public enum RoomState
        {
            SettingUp,
            Arena,
            GameOver,
            TearingDown,
        }
    }
}
