namespace Common
{
    public abstract class GameRoom<PlayerType> where PlayerType : Player
    {
        public Dictionary<string, PlayerType> Players { get; private set; } = new Dictionary<string, PlayerType>();
        public string RoomId { get; private set; }
        public string ConnectionId { get; set; }
        public DateTime UpdatedTime { get; protected set; } = DateTime.UtcNow;
        public GameRoom(string roomId, string connectionId)
        {
            this.RoomId = roomId;
            this.ConnectionId = connectionId;
        }

        public PlayerType? CreatePlayer(string playerName, string connectionId)
        {
            var newPlayer = this.CreatePlayerInternal(playerName, connectionId);
            if (this.Players.ContainsKey(playerName))
            {
                return null;
            }

            this.Players[playerName] = newPlayer;
            return newPlayer;
        }

        protected abstract PlayerType CreatePlayerInternal(string playerName, string connectionId);

        protected bool TryAddNewPlayer(PlayerType newPlayer)
        {
            var playerName = newPlayer.Name;
            if (this.Players.ContainsKey(playerName))
            {
                return false;
            }

            this.Players[playerName] = newPlayer;
            return true;
        }

        public override int GetHashCode()
        {
            return this.RoomId.GetHashCode();
        }

        public override bool Equals(object? obj)
        {
            if (obj is not GameRoom<PlayerType> g)
            {
                return false;
            }
            else
            {
                return g.RoomId == this.RoomId;
            }
        }
    }
}
