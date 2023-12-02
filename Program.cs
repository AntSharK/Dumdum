using Dumdum.Auth;
using Swollball;

var builder = WebApplication.CreateBuilder(args);
SecretManager.Init(builder);
var userDbConnectionString = string.Format(@"Data Source=antsharkbackend.database.windows.net;Initial Catalog=UserInfo;
User ID={0};
Password={1};
Connect Timeout=30;Encrypt=True;TrustServerCertificate=False;ApplicationIntent=ReadWrite;MultiSubnetFailover=False", 
SecretManager.GetSecret("AntsharkBackendUsername", builder),
SecretManager.GetSecret("AntsharkBackendPassword", builder));
UserInfoDB.Init(userDbConnectionString);

// Configure Auth in Builder
GeneralAuth.ConfigureAuth(builder);

builder.Services.AddSignalR();

// Add game lobbies
builder.Services.AddSingleton<Swollball.SwollballLobby>();
// End game lobbies

builder.Services.AddRazorPages();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure Auth for App
GeneralAuth.ConfigureAuth(app);

app.Logger.LogInformation("Starting up...");

// Add logging and hubs for games
Swollball.GameHub.RegisterLogger(app.Logger);
app.MapHub<Swollball.GameHub>("/swollBallHub");

Zombbomb.GameHub.RegisterLogger(app.Logger);
app.MapHub<Zombbomb.GameHub>("/zombBombHub");
// End game logging and hubs

app.MapRazorPages();
app.Run();