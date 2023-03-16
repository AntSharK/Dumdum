using Common;
using Swollball.PlayerData;

namespace Swollball
{
    public class SwollballLobby : GameLobby<SwollballRoom, SwollballPlayer>
    {
        protected override SwollballRoom CreateRoomInternal(string roomId, string connectionId)
        {
            return new SwollballRoom(roomId, connectionId);
        }
    }
}
