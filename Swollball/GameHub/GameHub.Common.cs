using Microsoft.AspNetCore.SignalR;

namespace Swollball
{
    public partial class GameHub : Hub
    {
        private static Lobby GameLobby = new Lobby();

        /// <inheritdoc />
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("FreshConnection");
            await base.OnConnectedAsync();
        }
    }
}
