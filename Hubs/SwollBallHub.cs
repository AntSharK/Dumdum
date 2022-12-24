using Microsoft.AspNetCore.SignalR;

namespace Dumdum.Hubs
{
    public class SwollBallHub : Hub
    {
        /// <inheritdoc />
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("FreshConnection");
            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Creates a room in the lobby
        /// </summary>
        /// <returns>A task</returns>
        public async Task CreateRoom()
        {
            // TODO
        }
    }
}
