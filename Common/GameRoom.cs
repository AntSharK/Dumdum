namespace Common
{
    public abstract class GameRoom<T> where T : Player
    {
        public Dictionary<string, T> Players { get; private set; } = new Dictionary<string, T>();
        public string RoomId { get; private set; }
        public string ConnectionId { get; set; }
        public DateTime UpdatedTime { get; protected set; } = DateTime.UtcNow;
        public GameRoom(string roomId, string connectionId)
        {
            this.RoomId = roomId;
            this.ConnectionId = connectionId;
        }

        public abstract T? CreatePlayer(string playerName, string connectionId);

        protected bool TryAddNewPlayer(T newPlayer)
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
            if (obj is not GameRoom<T> g)
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
