using Swollball.Upgrades;
namespace Swollball.Bots
{
    internal static class BotCreator
    {
        private static Random rng = new Random();
        private static List<string> BotNames = new List<string>()
        {
            "MOOF", "LOW", "YU", "CHENG",
            "ANT", "SHARK",
            "MM", "CUI", "MU", "YING",
            "VJ", "PEM", "MA", "RAJ", "JU",
        };

        internal static Player? CreateAutomatedPlayer(this GameRoom room, Func<IUpgrade, int>? implementedStrat, Func<Player, int>? tierUpStrat, string postFix)
        {
            var i = rng.Next(BotNames.Count);

            if (implementedStrat == null)
            {
                var strat = rng.Next(4);
                switch (strat)
                {
                    case 0:
                        implementedStrat = UpgradeScores.ArmorBulwarker;
                        postFix += "AB";
                        break;
                    case 1:
                        implementedStrat = UpgradeScores.ArmorSustain;
                        postFix += "AS";
                        break;
                    case 2:
                        implementedStrat = UpgradeScores.DamageSustain;
                        postFix += "DS";
                        break;
                    default:
                        implementedStrat = UpgradeScores.Random;
                        postFix += "RAN";
                        break;
                }
            }

            if (tierUpStrat == null)
            {
                var tierUpPriority = rng.Next(3);
                switch (tierUpPriority)
                {
                    case 0:
                        tierUpStrat = TierUpStrategy.Never;
                        postFix += "0";
                        break;
                    case 1:
                        tierUpStrat = TierUpStrategy.Sometimes;
                        postFix += "1";
                        break;
                    case 2:
                        tierUpStrat = TierUpStrategy.Always;
                        postFix += "2";
                        break;
                    default:
                        tierUpStrat = TierUpStrategy.Never;
                        break;
                }
            }

            var playerName = BotNames[i] + (room.Players.Count() + 1) + postFix;
            var newPlayer = new StrategyImplementingBot(playerName, room.RoomId, implementedStrat, tierUpStrat);

            // Assign the bot a random color
            newPlayer.Ball.Color = rng.Next(0xFFFFFF);

            if (room.Players.ContainsKey(playerName))
            {
                return null;
            }

            room.Players[playerName] = newPlayer;
            return newPlayer;
        }
    }
}
