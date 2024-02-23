using System.Drawing;
using Common;

namespace Octoprotecto
{
    public class OctoprotectoRoom : GameRoom<Octopus>
    {
        public RoomState State { get; private set; } = RoomState.SettingUp;
        public Rectangle OctopiMovementBounds;

        public OctoprotectoRoom(string roomId, string connectionId) 
            : base(roomId, connectionId)
        {
        }

        protected override Octopus CreatePlayerInternal(string playerName, string connectionId)
        {
            return new Octopus(playerName, connectionId, this.RoomId);
        }

        public void StartGame()
        {
            this.State = RoomState.Arena;
        }

        public enum RoomState
        {
            SettingUp,
            Arena,
            Upgrading,
            GameOver,
            TearingDown,
        }
    }
}
