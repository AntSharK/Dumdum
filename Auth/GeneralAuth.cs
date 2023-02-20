using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;

namespace Dumdum.Auth
{
    public static class GeneralAuth
    {
        internal const string CookiesSignInScheme = "Cookies";
        internal const string LoginPath = "/login";
        internal const string AccountDetailsPath = "/checklogin";
        internal const string ClearCookiesPath = "/clearcookies";
        internal const string AuthSchemeQueryString = "authscheme";

        internal static void ConfigureAuth(WebApplicationBuilder builder)
        {
            if (builder?.Configuration == null) { return; }

            builder.Services.AddAuthentication()
                .AddCookie(GeneralAuth.CookiesSignInScheme)
                .AddMicrosoftAccount(MSAAuth.AuthScheme, options => MSAAuth.ConfigureAuth(options, builder))
                .AddGoogle(GAuth.AuthScheme, options => GAuth.ConfigureAuth(options, builder));
        }

        internal static async Task OnCreatingTicket(OAuthCreatingTicketContext context)
        {
            if (context.Identity == null) { return; }

            // Retrieve the rating and whatsnot from the database
            var authResult = new AuthResult(context.Identity);
            if (authResult.IsAuthenticated)
            {
                await UserInfoDB.OnAuthentication(authResult).ConfigureAwait(false);
            }
        }

        internal static void ConfigureAuth(WebApplication app)
        {
            app.UseAuthentication();
            app.UseAuthorization();

            app.Map(LoginPath, (app =>
            {
                app.Run(async context =>
                {
                    var authScheme = context.Request.Query[AuthSchemeQueryString];
                    await context.ChallengeAsync(authScheme, new AuthenticationProperties() { RedirectUri = "/" });
                });
            }));

            app.Map(ClearCookiesPath, (app =>
            {
                app.Run(async context =>
                {
                    // Delete all cookies
                    foreach (var cookie in context.Request.Cookies)
                    {
                        context.Response.Cookies.Delete(cookie.Key);
                    }

                    await context.Response.WriteAsync("Cookies deleted<br><a href='/'>RETURN</a>");
                });
            }));

            app.Map(AccountDetailsPath, (app =>
            {
                app.Run(async context =>
                {
                    var authIdentity = await context.AuthenticateAsync(CookiesSignInScheme);
                    if (authIdentity != null
                        && authIdentity.Succeeded
                        && authIdentity?.Principal?.Claims != null)
                    {
                        await context.Response.WriteAsync("LOGGED IN\n");
                        foreach (var claim in authIdentity.Principal.Claims)
                        {
                            await context.Response.WriteAsync(claim.Type + ": " + claim.Value + "\n");
                        }
                    }
                    else
                    {
                        await context.Response.WriteAsync("NOT LOGGED IN");
                    }
                });
            }));
        }
    }
}
