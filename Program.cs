var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
builder.Services.AddSingleton<Swollball.Lobby>();
builder.Services.AddRazorPages();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.Logger.LogInformation("Starting up...");
Swollball.GameHub.RegisterLogger(app.Logger);
app.MapHub<Swollball.GameHub>("/swollBallHub");
app.MapRazorPages();

app.Run();