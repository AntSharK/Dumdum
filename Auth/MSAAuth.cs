﻿using Microsoft.AspNetCore.Authentication.MicrosoftAccount;

namespace Dumdum.Auth
{
    public static class MSAAuth
    {
        internal const string AuthScheme = "MSAAuth";
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
