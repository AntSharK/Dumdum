using Swollball.PlayerData;
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

        internal static SwollballPlayer? CreateAutomatedPlayer(this SwollballRoom room, Func<IUpgrade, int>? implementedStrat, Func<SwollballPlayer, int>? tierUpStrat, string botStratString)
        {
            var i = rng.Next(BotNames.Count);

            if (implementedStrat == null)
            {
                var strat = rng.Next(4);
                switch (strat)
                {
                    case 0:
                        implementedStrat = UpgradeScores.ArmorBulwarker;
                        botStratString += "AB";
                        break;
                    case 1:
                        implementedStrat = UpgradeScores.ArmorSustain;
                        botStratString += "AS";
                        break;
                    case 2:
                        implementedStrat = UpgradeScores.DamageSustain;
                        botStratString += "DS";
                        break;
                    default:
                        implementedStrat = UpgradeScores.Random;
                        botStratString += "RAN";
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
                        botStratString += "0";
                        break;
                    case 1:
                        tierUpStrat = TierUpStrategy.Sometimes;
                        botStratString += "1";
                        break;
                    case 2:
                        tierUpStrat = TierUpStrategy.Always;
                        botStratString += "2";
                        break;
                    default:
                        tierUpStrat = TierUpStrategy.Never;
                        break;
                }
            }

            var playerName = BotNames[i] + "BOT" + (room.Players.Count() + 1);
            var newPlayer = new StrategyImplementingBot(playerName, room.RoomId, implementedStrat, tierUpStrat);

            // Assign the bot a random color
            newPlayer.Ball.Color = rng.Next(0xFFFFFF);
            newPlayer.PlayerEmail = botStratString + "bot@antsharkbot";

            if (room.Players.ContainsKey(playerName))
            {
                return null;
            }

            room.Players[playerName] = newPlayer;
            return newPlayer;
        }
    }
}
