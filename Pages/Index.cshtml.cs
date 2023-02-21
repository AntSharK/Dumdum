using Dumdum.Auth;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Swollball.Auth;

namespace Dumdum.Pages
{
    public class IndexModel : PageModel
    {
        public string BuildNumber => "vBeta 0.220.0344";
        public AuthResult? AuthResult { get; private set; }
        public string MSAAuthLink => GeneralAuth.LoginPath + '?' + GeneralAuth.AuthSchemeQueryString + '=' + MSAAuth.AuthScheme;
        public string GoogleAuthLink => GeneralAuth.LoginPath + '?' + GeneralAuth.AuthSchemeQueryString + '=' + GAuth.AuthScheme;
        public string CheckAccountLink => GeneralAuth.AccountDetailsPath;
        public string ClearCookiesLink => GeneralAuth.ClearCookiesPath;

        public async Task OnGet()
        {
            this.AuthResult = await GeneralAuth.GetAuthResultForPage(this).ConfigureAwait(false);
        }
    }
}
