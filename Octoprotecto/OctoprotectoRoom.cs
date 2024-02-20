using Common;

namespace Octoprotecto
{
    public class OctoprotectoRoom : GameRoom<Octopus>
    {
        public OctoprotectoRoom(string roomId, string connectionId) 
            : base(roomId, connectionId)
        {
        }

        protected override Octopus CreatePlayerInternal(string playerName, string connectionId)
        {
            return new Octopus(playerName, connectionId, this.RoomId);
        }
    }
}
