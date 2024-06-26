﻿using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class Damage : BaseUpgrade
    {
        public Damage(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.DAMAGEUPGRADE);
        }

        public override string Description => $"Damage+{this.UpgradeAmount}";
        public override int BorderColor => Colors.BROWN;

        public override void PerformUpgrade(SwollballPlayer player)
        {
            player.Ball.IncreaseStat(UpgradeTags.DAMAGEUPGRADE, this.UpgradeAmount, 0 /*Depth*/);
            base.PerformUpgrade(player);
        }
    }
}
