﻿using Common;

namespace Zombbomb
{
    /// <summary>
    /// The Zombbomb room also contains data on the room owner, i.e. the player controlling the main screen
    /// </summary>
    public class ZombbombRoom : GameRoom<Zombie>
    {
        public ZombbombRoom(string roomId, string connectionId)
            : base(roomId, connectionId)
        {
        }

        protected override Zombie CreatePlayerInternal(string playerName, string connectionId)
        {
            return new Zombie(playerName, connectionId, this.RoomId);
        }
    }
}