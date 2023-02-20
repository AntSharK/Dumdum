using Microsoft.AspNetCore.Components.Web;
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
            using var connection = new SqlConnection(BackendConnectionString);
            await connection.OpenAsync().ConfigureAwait(false);

            var foundInDb = await FindUser(connection, authResult).ConfigureAwait(false);

            // Update the DB with the last login time if the user is found
            if (foundInDb)
            {
                await UpdateUserInfo(connection, authResult);
            }
            // Otherwise create the entry in the DB
            else
            {
                await CreateUser(connection, authResult).ConfigureAwait(false);
                await CreateSwollballRating(connection, authResult).ConfigureAwait(false);
            }
        }

        private static async Task<bool> FindUser(SqlConnection connection, AuthResult authResult)
        {
            var command = new SqlCommand($"SELECT * FROM dbo.UserLogin WHERE Email='{authResult.Email}'", connection);
            using (var reader = await command.ExecuteReaderAsync().ConfigureAwait(false))
            {
                if (!reader.HasRows)
                {
                    return false;
                }

                while (await reader.ReadAsync().ConfigureAwait(false))
                {
                    // TODO: Write any other auth info from the DB into the cookie
                    return true;
                }
            }

            return false;
        }

        private static async Task UpdateUserInfo(SqlConnection connection, AuthResult authResult)
        {
            // Update the last login time
            var updateCommand = new SqlCommand("UPDATE dbo.UserLogin SET LastLogin = @lastlogin WHERE Email = @email", connection);
            updateCommand.Parameters.AddWithValue("@lastlogin", DateTime.UtcNow);
            updateCommand.Parameters.AddWithValue("@email", authResult.Email);
            await updateCommand.ExecuteNonQueryAsync();

            // Pull rating data
            var getSwollballRatingCommand = new SqlCommand($"SELECT * FROM dbo.SwollballRating WHERE Email='{authResult.Email}'", connection);
            var foundUserSwollballRating = false;
            using (var reader = await getSwollballRatingCommand.ExecuteReaderAsync().ConfigureAwait(false))
            {
                if (reader.HasRows)
                {
                    foundUserSwollballRating = true;
                    while (await reader.ReadAsync().ConfigureAwait(false))
                    {
                        authResult.SwollballRating = reader.GetInt32(1);
                    }
                }
            }

            if (!foundUserSwollballRating)
            {
                await CreateSwollballRating(connection, authResult).ConfigureAwait(false);
            }
        }

        private static async Task CreateUser(SqlConnection connection, AuthResult authResult)
        {
            var createCommand = new SqlCommand("INSERT INTO dbo.UserLogin VALUES (@email, @lastlogin, @createdat)", connection);
            createCommand.Parameters.AddWithValue("@email", authResult.Email);
            createCommand.Parameters.AddWithValue("@lastlogin", DateTime.UtcNow);
            createCommand.Parameters.AddWithValue("@createdat", DateTime.UtcNow);
            await createCommand.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task CreateSwollballRating(SqlConnection connection, AuthResult authResult)
        {
            authResult.SwollballRating = 1000;

            var createCommand = new SqlCommand("INSERT INTO dbo.SwollballRating VALUES (@email, @swollballrating)", connection);
            createCommand.Parameters.AddWithValue("@email", authResult.Email);
            createCommand.Parameters.AddWithValue("@swollballrating", authResult.SwollballRating);
            await createCommand.ExecuteNonQueryAsync().ConfigureAwait(false);
        }
    }
}
