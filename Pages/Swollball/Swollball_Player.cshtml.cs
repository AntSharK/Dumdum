using Dumdum.Auth;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Dumdum.Pages.Swollball
{
    public class Swollball_PlayerModel : PageModel
    {
        public AuthResult? AuthResult { get; private set; }

        public async Task OnGet()
        {
            this.AuthResult = await GeneralAuth.GetAuthResultForPage(this).ConfigureAwait(false);
        }
    }
}
