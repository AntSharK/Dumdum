﻿using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class DamageWhenSpeed : BasePersistentUpgrade
    {
        public DamageWhenSpeed(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.DAMAGEUPGRADE);
            this.Tags.Add(UpgradeTags.TRIGGERONSPEEDUPGRADE);
        }

        public override string Description => $"Damage+{this.UpgradeAmount} for every 10 speed gained";

        public override int BorderColor => Colors.BROWN;
        public override int FillColor => Colors.SKYBLUE;

        public override void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            var damageIncrease = (this.UpgradeAmount * triggerStatIncrease) / 10;
            ball.IncreaseStat(UpgradeTags.DAMAGEUPGRADE, damageIncrease, triggerUpgradeDepth);
            base.Trigger(ball, increasedStat, triggerStatIncrease, triggerUpgradeDepth);
        }
    }
}
