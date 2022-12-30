var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR().AddJsonProtocol();
builder.Services.AddSingleton<Swollball.Lobby>();
builder.Services.AddRazorPages();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHub<Swollball.GameHub>("/swollBallHub");
app.MapRazorPages();

app.Run();
