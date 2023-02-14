using Azure.Identity;
using Microsoft.Extensions.Azure;

namespace Dumdum.Auth
{
    internal static class SecretManager
    {
        internal static void Init(WebApplicationBuilder builder)
        {
            if (builder.Environment.IsProduction())
            {
                builder.Configuration.AddAzureKeyVault(
                    new Uri($"https://antshark-vault.vault.azure.net/"),
                    new DefaultAzureCredential());
            }
        }

        internal static string GetSecret(string secretName, WebApplicationBuilder builder)
        {
            return builder.Configuration[secretName] ?? string.Empty;
        }

    }
}
