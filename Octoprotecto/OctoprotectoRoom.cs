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

        internal void EndGame()
        {
            this.State = RoomState.GameOver;
        }

        internal void FinishRound(IDictionary<string, int> pointsPerOctopus)
        {
            this.State = RoomState.Upgrading;
            foreach (var entry in pointsPerOctopus)
            {
                if (this.Players.ContainsKey(entry.Key))
                {
                    this.Players[entry.Key].Points = entry.Value;
                }
            }

            foreach (var player in Players.Values)
            {
                player.IsActive = false;
            }
        }

        public enum RoomState
        {
            SettingUp,
            Arena,
            Upgrading,
            GameOver,
        }
    }
}
