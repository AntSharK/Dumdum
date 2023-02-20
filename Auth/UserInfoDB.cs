using Microsoft.Data.SqlClient;

namespace Dumdum.Auth
{
    public static class UserInfoDB
    {
        private static string BackendConnectionString = @"Data Source=antsharkbackend.database.windows.net;Initial Catalog=UserInfo;
User ID={0};
Password={1};
Connect Timeout=30;Encrypt=True;TrustServerCertificate=False;ApplicationIntent=ReadWrite;MultiSubnetFailover=False";

        public static void Init(WebApplicationBuilder builder)
        {
            BackendConnectionString = string.Format(BackendConnectionString,
                SecretManager.GetSecret("AntsharkBackendUsername", builder),
                SecretManager.GetSecret("AntsharkBackendPassword", builder));
        }

        public static async Task OnAuthentication(AuthResult authResult)
        {
            var foundInDb = false;
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
}
