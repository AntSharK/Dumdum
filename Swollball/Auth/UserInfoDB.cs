﻿using Microsoft.Data.SqlClient;
using System.Text;

namespace Swollball.Auth
{
    public static class UserInfoDB
    {
        private static string? BackendConnectionString;

        public static void Init(string backendConnectionString)
        {
            BackendConnectionString = backendConnectionString;
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

        public static async Task<IDictionary<string, int>> GetPlayerRatings(IEnumerable<string?> playerEmails)
        {
            using var connection = new SqlConnection(BackendConnectionString);
            await connection.OpenAsync().ConfigureAwait(false);

            // Pull rating data
            var dictionaryToReturn = new Dictionary<string, int>();
            var sb = new StringBuilder();
            foreach (var email in playerEmails)
            {
                sb.Append('\'');
                sb.Append(email);
                sb.Append('\'');
                sb.Append(',');
            }
            sb.Length--;
            var getSwollballRatingCommand = new SqlCommand($"SELECT Email,Rating FROM dbo.SwollballRating WHERE Email IN (" + sb.ToString() + ")", connection);
            using (var reader = await getSwollballRatingCommand.ExecuteReaderAsync().ConfigureAwait(false))
            {
                if (reader.HasRows)
                {
                    while (await reader.ReadAsync().ConfigureAwait(false))
                    {
                        dictionaryToReturn[reader.GetString(0)] = reader.GetInt32(1);
                    }
                }
            }

            return dictionaryToReturn;
        }

        public static async Task<int> GetSwollballRating(AuthResult authResult)
        {
            using var connection = new SqlConnection(BackendConnectionString);
            await connection.OpenAsync().ConfigureAwait(false);

            // Pull rating data
            var getSwollballRatingCommand = new SqlCommand($"SELECT Rating FROM dbo.SwollballRating WHERE Email=@email", connection);
            getSwollballRatingCommand.Parameters.AddWithValue("@email", authResult.Email);
            using (var reader = await getSwollballRatingCommand.ExecuteReaderAsync().ConfigureAwait(false))
            {
                if (reader.HasRows)
                {
                    while (await reader.ReadAsync().ConfigureAwait(false))
                    {
                        return reader.GetInt32(0);
                    }
                }
            }

            // If no rows were found, 
            return await CreateSwollballRating(connection, authResult).ConfigureAwait(false);
        }

        private static async Task<bool> FindUser(SqlConnection connection, AuthResult authResult)
        {
            var command = new SqlCommand($"SELECT * FROM dbo.UserLogin WHERE Email=@email", connection);
            command.Parameters.AddWithValue("@email", authResult.Email);
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
        }

        private static async Task CreateUser(SqlConnection connection, AuthResult authResult)
        {
            var createCommand = new SqlCommand("INSERT INTO dbo.UserLogin VALUES (@email, @lastlogin, @createdat)", connection);
            createCommand.Parameters.AddWithValue("@email", authResult.Email);
            createCommand.Parameters.AddWithValue("@lastlogin", DateTime.UtcNow);
            createCommand.Parameters.AddWithValue("@createdat", DateTime.UtcNow);
            await createCommand.ExecuteNonQueryAsync().ConfigureAwait(false);
        }

        private static async Task<int> CreateSwollballRating(SqlConnection connection, AuthResult authResult)
        {
            const int DEFAULTSWOLLBALLRATING = 1000;
            var createCommand = new SqlCommand("INSERT INTO dbo.SwollballRating VALUES (@email, @swollballrating)", connection);
            createCommand.Parameters.AddWithValue("@email", authResult.Email);
            createCommand.Parameters.AddWithValue("@swollballrating", DEFAULTSWOLLBALLRATING);
            await createCommand.ExecuteNonQueryAsync().ConfigureAwait(false);

            return DEFAULTSWOLLBALLRATING;
        }
    }
}
