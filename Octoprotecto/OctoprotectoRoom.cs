using System.Drawing;
using Common;

namespace Octoprotecto
{
    public class OctoprotectoRoom : GameRoom<Octopus>
    {
        public RoomState State { get; private set; } = RoomState.SettingUp;
        public bool IsSoloRun { get; internal set; } = false;

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

        internal void FinishRound(IDictionary<string, int> pointsPerOctopus,
            IDictionary<string, int> damagePerWeapon)
        {
            this.State = RoomState.Upgrading;
            foreach (var entry in pointsPerOctopus)
            {
                if (this.Players.ContainsKey(entry.Key))
                {
                    this.Players[entry.Key].Points = entry.Value;
                }
            }

            foreach (var player in this.Players.Values)
            {
                // Update the weapon damage numbers
                foreach (var weapon in player.Weapons)
                {
                    if (damagePerWeapon.ContainsKey(weapon.Name))
                    {
                        weapon.DamageDealt = damagePerWeapon[weapon.Name];
                    }
                }

                player.NextRound();
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
