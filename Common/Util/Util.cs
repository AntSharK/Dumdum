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

        /// <summary>
        /// Returns an array of items, given the chances for each item to appear
        /// </summary>
        /// <typeparam name="T">The type of item</typeparam>
        /// <param name="oddsList">The odds of each item appearing</param>
        /// <returns>An array of items, with each item multiplied by its odds</returns>
        public static T[] CollateOdds<T>(params List<Tuple<int, T>>[] oddsList)
        {
            var totalSize = 0;
            foreach (var upgradeOdds in oddsList)
            {
                foreach (var upg in upgradeOdds)
                {
                    totalSize += upg.Item1;
                }
            }

            var array = new T[totalSize];
            var idx = 0;
            foreach (var odds in oddsList)
            {
                foreach (var odd in odds)
                {
                    for (var i = 0; i < odd.Item1; i++)
                    {
                        array[idx] = odd.Item2;
                        idx++;
                    }
                }
            }

            return array;
        }
    }
}
