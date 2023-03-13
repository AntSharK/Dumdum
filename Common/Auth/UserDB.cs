using Microsoft.Data.SqlClient;
using System.Text;

namespace Common.Auth
{
    public static class UserDB
    {
        private static string? BackendConnectionString;

        public static void Init(string backendConnectionString)
        {
            BackendConnectionString = backendConnectionString;
        }

        public static async Task UpdatePlayerRatings(IDictionary<string, int> emailsToRatings)
        {
            using var connection = new SqlConnection(BackendConnectionString);
            await connection.OpenAsync().ConfigureAwait(false);

            foreach (var emailToRating in emailsToRatings)
            {
                var updateCommand = new SqlCommand("UPDATE dbo.SwollballRating SET Rating = @rating WHERE Email = @email", connection);
                updateCommand.Parameters.AddWithValue("@rating", emailToRating.Value);
                updateCommand.Parameters.AddWithValue("@email", emailToRating.Key);
                await updateCommand.ExecuteNonQueryAsync().ConfigureAwait(false);
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
