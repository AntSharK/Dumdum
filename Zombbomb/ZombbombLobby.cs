using Common;

namespace Zombbomb
{
    public class ZombbombLobby : GameLobby<ZombbombRoom, Zombie>
    {
        protected override ZombbombRoom CreateRoomInternal(string roomId, string connectionId)
        {
            return new ZombbombRoom(roomId, connectionId);
        }
    }
}
