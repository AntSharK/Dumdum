using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authentication.OAuth;

namespace Dumdum.Auth
{
    public static class MSAAuth
    {
        internal const string AuthScheme = "MSAAuth";
        internal const string LoginPath = "/msalogin";
        private const string LandingPath = "/msalanding";        

        internal static void ConfigureAuth(MicrosoftAccountOptions options, WebApplicationBuilder builder)
        {
            options.ClientId = SecretManager.GetSecret("MSAAuthClientId", builder);
            options.ClientSecret = SecretManager.GetSecret("MSAAuthClientSecret", builder);
            options.CallbackPath = LandingPath;
            options.SignInScheme = GeneralAuth.CookiesSignInScheme;
            options.TokenEndpoint = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
            options.AuthorizationEndpoint = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
            options.Events.OnCreatingTicket = GeneralAuth.OnCreatingTicket;
        }
    }
}
