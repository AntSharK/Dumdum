using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.MicrosoftAccount;

namespace Dumdum.Auth
{
    /// <summary>
    /// For GOOGLE Auth
    /// </summary>
    public class GAuth
    {
        internal const string AuthScheme = "GAuth";
        private const string LandingPath = "/googlelanding";

        internal static void ConfigureAuth(GoogleOptions options, WebApplicationBuilder builder)
        {
            options.ClientId = SecretManager.GetSecret("GAuthClientId", builder);
            options.ClientSecret = SecretManager.GetSecret("GAuthClientSecret", builder);
            options.CallbackPath = LandingPath;
            options.SignInScheme = GeneralAuth.CookiesSignInScheme;
            options.Events.OnCreatingTicket = GeneralAuth.OnCreatingTicket;
        }
    }
}
