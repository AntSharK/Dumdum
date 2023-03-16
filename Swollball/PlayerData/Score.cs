namespace Swollball.PlayerData
{
    public class Score
    {
        public int PointsLeft { get; set; } = 0;
        public int PointsDeducted { get; set; } = 0;
        public int RoundDamageDone { get; set; } = 0;
        public int RoundDamageReceived { get; set; } = 0;
        public string PlayerName { get; private set; }
        public int RoundNumber { get; set; } = 0;
        public int TotalDamageDone { get; set; } = 0;
        public int TotalDamageReceived { get; set; } = 0;


        public Score(string name)
        {
            PlayerName = name;
        }

        public void ResetRound()
        {
            RoundDamageReceived = 0;
            RoundDamageDone = 0;
        }
    }
}
