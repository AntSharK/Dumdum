using Common;

namespace Octoprotecto
{
    public class OctoprotectoLobby : GameLobby<OctoprotectoRoom, Octopus>
    {
        protected override OctoprotectoRoom CreateRoomInternal(string roomId, string connectionId)
        {
            return new OctoprotectoRoom(roomId, connectionId);
        }
    }
}
