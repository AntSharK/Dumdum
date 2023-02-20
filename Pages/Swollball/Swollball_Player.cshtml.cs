using Dumdum.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Swollball;

namespace Dumdum.Pages.Swollball
{
    public class Swollball_PlayerModel : PageModel
    {
        private Lobby Lobby;
        private ILogger<Swollball_PlayerModel> Logger;

        public Swollball_PlayerModel(ILogger<Swollball_PlayerModel> logger,
            [FromServices] Lobby lobby)
        {
            this.Lobby = lobby;
            this.Logger = logger;
        }

        public AuthResult? AuthResult { get; private set; }
        public int SwollballRating { get; private set; }

        public async Task OnGet(
            [FromQuery] string action,
            [FromQuery] string userNameIn,
            [FromQuery] string roomIdIn)
        {
            this.AuthResult = await GeneralAuth.GetAuthResultForPage(this).ConfigureAwait(false);
            if (this.AuthResult == null)
            {
                return;
            }

            this.SwollballRating = await UserInfoDB.GetSwollballRating(this.AuthResult).ConfigureAwait(false);

            // Game start - load auth result
            if (action == "GAMESTARTACTION"
                && !string.IsNullOrEmpty(userNameIn)
                && !string.IsNullOrEmpty(roomIdIn))
            {
                if (this.AuthResult?.Email != null 
                    && this.AuthResult.IsAuthenticated)
                {
                    if (this.Lobby.Rooms.ContainsKey(roomIdIn)
                        && this.Lobby.Rooms[roomIdIn].Players.ContainsKey(userNameIn))
                    {
                        var player = this.Lobby.Rooms[roomIdIn].Players[userNameIn];
                        this.Logger.LogInformation("Room {0}, User {1}, has Email {2}", roomIdIn, userNameIn, this.AuthResult.Email);
                        player.PlayerEmail = this.AuthResult.Email;
                    }
                    else
                    {
                        this.Logger.LogInformation("Unable to map - Room {0}, User {1}, Email {2}", roomIdIn, userNameIn, this.AuthResult.Email);
                    }
                }
            }
        }
    }
}
