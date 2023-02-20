using Dumdum.Auth;

var builder = WebApplication.CreateBuilder(args);
SecretManager.Init(builder);

// Configure Auth in Builder
MSAAuth.AddAuth(builder);

builder.Services.AddSignalR();
builder.Services.AddSingleton<Swollball.Lobby>();
builder.Services.AddRazorPages();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure Auth for App
MSAAuth.ConfigureAuth(app);

app.Logger.LogInformation("Starting up...");
Swollball.GameHub.RegisterLogger(app.Logger);

app.UseDeveloperExceptionPage();
app.MapHub<Swollball.GameHub>("/swollBallHub");

app.MapRazorPages();

app.Run();