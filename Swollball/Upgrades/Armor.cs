using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class Armor : BaseUpgrade
    {
        public Armor(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.ARMORUPGRADE);
        }

        public override string Description => $"Armor+{this.UpgradeAmount}";
        public override int BorderColor => Colors.GREEN;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            player.Ball.IncreaseStat(UpgradeTags.ARMORUPGRADE, this.UpgradeAmount, 0 /*Depth*/);
            base.PerformUpgrade(player);
        }
    }
}
