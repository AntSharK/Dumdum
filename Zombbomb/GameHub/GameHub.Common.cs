using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Zombbomb
{
    public partial class GameHub : Hub
    {
        private static ILogger? Logger;

        public static void RegisterLogger(ILogger logger)
        {
            Logger = logger;
        }

        /// <inheritdoc />
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("FreshConnection");
            await base.OnConnectedAsync();

            // Test code - just start the game
            //await Clients.Caller.SendAsync("StartGame");
        }
    }
}
