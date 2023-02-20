using Dumdum.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Claims;

namespace Dumdum.Pages
{
    public class IndexModel : PageModel
    {
        public string BuildNumber => "vBeta 0.220.0300";
        public AuthResult? AuthResult { get; private set; }
        public string MSAAuthLink => GeneralAuth.LoginPath + '?' + GeneralAuth.AuthSchemeQueryString + '=' + MSAAuth.AuthScheme;
        public string GoogleAuthLink => GeneralAuth.LoginPath + '?' + GeneralAuth.AuthSchemeQueryString + '=' + GAuth.AuthScheme;
        public string CheckAccountLink => GeneralAuth.AccountDetailsPath;
        public string ClearCookiesLink => GeneralAuth.ClearCookiesPath;

        public async Task OnGet()
        {
            var authIdentity = await HttpContext.AuthenticateAsync(GeneralAuth.CookiesSignInScheme).ConfigureAwait(false);

            if (authIdentity.Succeeded
                && authIdentity.Principal?.Identity != null)
            {
                this.AuthResult = new AuthResult(authIdentity.Principal.Identity as ClaimsIdentity);
            }
        }
    }
}
