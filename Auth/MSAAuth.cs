using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.Data.SqlClient;

namespace Dumdum.Auth
{
    public static class MSAAuth
    {
        public static string BackendConnectionString = @"Data Source=antsharkbackend.database.windows.net;Initial Catalog=UserInfo;
User ID={0};
Password={1};
Connect Timeout=30;Encrypt=True;TrustServerCertificate=False;ApplicationIntent=ReadWrite;MultiSubnetFailover=False";

        private const string CookiesSignInScheme = "Cookies";
        private const string MSAAuthScheme = "MSAAuth";

        internal static void AddAuth(WebApplicationBuilder builder)
        {
            BackendConnectionString = string.Format(BackendConnectionString,
                SecretManager.GetSecret("AntsharkBackendUsername", builder),
                SecretManager.GetSecret("AntsharkBackendPassword", builder));

            if (builder?.Configuration == null) { return; }

            builder.Services.AddAuthentication()
                .AddCookie(CookiesSignInScheme)
                .AddMicrosoftAccount(MSAAuthScheme, options =>
                {
                    options.ClientId = SecretManager.GetSecret("MSAAuthClientId", builder);
                    options.ClientSecret = SecretManager.GetSecret("MSAAuthClientSecret", builder);
                    options.CallbackPath = "/landing";
                    options.SignInScheme = CookiesSignInScheme;
                    options.TokenEndpoint = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
                    options.AuthorizationEndpoint = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
                    options.Events.OnCreatingTicket = OnCreatingTicket;
                });
        }

        private static async Task OnCreatingTicket(OAuthCreatingTicketContext context)
        {
            if (context.Identity == null) { return; }

            // Retrieve the rating and whatsnot from the database
            var authResult = new AuthResult(context.Identity);
            var foundInDb = false;
            if (authResult.IsAuthenticated)
            {
                using var connection = new SqlConnection(BackendConnectionString);
                var command = new SqlCommand($"SELECT * FROM dbo.SwollballRating WHERE Email='{authResult.Email}'", connection);
                command.Connection.Open();
                using (var reader = await command.ExecuteReaderAsync().ConfigureAwait(false))
                {
                    while (await reader.ReadAsync())
                    {
                        foundInDb = true;
                        authResult.Rating = reader.GetInt32(1);
                    }
                }

                // Update the DB with the last login time if the user is found
                if (foundInDb)
                {
                    var updateCommand = new SqlCommand("UPDATE dbo.SwollballRating SET LastLogin = @lastlogin WHERE Email = @email", connection);
                    updateCommand.Parameters.AddWithValue("@lastlogin", DateTime.UtcNow);
                    updateCommand.Parameters.AddWithValue("@email", authResult.Email);
                    var result = await updateCommand.ExecuteNonQueryAsync();
                }
                // Otherwise create the entry in the DB
                else
                {
                    authResult.Rating = 1000;
                    var createCommand = new SqlCommand("INSERT INTO dbo.SwollballRating VALUES (@email, @rating, @lastlogin, @createdat)", connection);
                    createCommand.Parameters.AddWithValue("@email", authResult.Email);
                    createCommand.Parameters.AddWithValue("@rating", authResult.Rating);
                    createCommand.Parameters.AddWithValue("@lastlogin", DateTime.UtcNow);
                    createCommand.Parameters.AddWithValue("@createdat", DateTime.UtcNow);
                    var result = await createCommand.ExecuteNonQueryAsync();
                }
            }
        }

        internal static void ConfigureAuth(WebApplication app)
        {
            app.UseAuthentication();
            app.UseAuthorization();

            app.Map("/login", (app =>
            {
                app.Run(async context =>
                {
                    await context.ChallengeAsync(MSAAuthScheme, new AuthenticationProperties() { RedirectUri = "/" });
                });
            }));
            app.Map("/checklogin", (app =>
            {
                app.Run(async context =>
                {
                    var authIdentity = await context.AuthenticateAsync(CookiesSignInScheme);
                    if (authIdentity != null
                        && authIdentity.Succeeded
                        && authIdentity?.Principal?.Claims != null)
                    {
                        await context.Response.WriteAsync("LOGGED IN<br>");
                        foreach (var claim in authIdentity.Principal.Claims)
                        {
                            await context.Response.WriteAsync(claim.Type + ": " + claim.Value + "<br>");
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
