using System.Drawing;
using Common;

namespace Zombbomb
{
    /// <summary>
    /// The Zombbomb room also contains data on the room owner, i.e. the player controlling the main screen
    /// </summary>
    public class ZombbombRoom : GameRoom<Zombie>
    {
        public RoomState State { get; private set; }

        public Rectangle ZombieBounds;

        // Configurations
        public int ExplodeTime;
        public double ZombieSpeed;
        public double PlayerSpeed;
        public int ReloadTime;
        public int RespawnTime;

        public ZombbombRoom(string roomId, string connectionId)
            : base(roomId, connectionId)
        {
            this.ResetState();
        }

        internal void ResetState()
        {
            this.State = RoomState.SettingUp;
            this.ZombieBounds = new Rectangle(0, 0, 1400, 200); // Note that this should mirror the game width on the client-side
        }

        internal void StartRound()
        {
            this.ZombieBounds.Height = 1024;
            this.State = ZombbombRoom.RoomState.Arena;
        }

        internal void EndGame()
        {
            this.State = RoomState.GameOver;
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
