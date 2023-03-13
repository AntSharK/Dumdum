namespace Common.Util
{
    public static class Utils
    {
        public static Random Rng { get; } = new();

        public static bool IsValidName(string userName, int minLength = 1, int maxLength = 10)
        {
            if (userName.Length < minLength
                || userName.Length > maxLength)
            {
                return false;
            }

            foreach (char c in userName.ToCharArray())
            {
                if (!char.IsLetterOrDigit(c))
                {
                    return false;
                }
            }

            return true;
        }

        public static string? GenerateId(int totalLength, IEnumerable<string> existingIds)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            string? id = null;
            int tries = 0;
            while (tries < 300 &&
                (id == null || existingIds.Contains(id)))
            {
                tries++;
                id = new string(Enumerable.Repeat(chars, totalLength).Select(
                    s => s[Rng.Next(s.Length)]).ToArray());
            }

            return id;
        }

        public static void Shuffle<T>(IList<T> list)
        {
            // Performs the fisher-yates shuffle
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = Rng.Next(n + 1);
                (list[k], list[n]) = (list[n], list[k]);
            }
        }
    }
}
