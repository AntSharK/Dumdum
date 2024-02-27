﻿using Common.Util;
using Swollball.PlayerData;

namespace Swollball.Upgrades
{
    public class SizeWhenHp : BasePersistentUpgrade
    {
        public SizeWhenHp(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.SIZEUPGRADE);
            this.Tags.Add(UpgradeTags.TRIGGERONHPUPGRADE);
        }

        public override string Description => $"Size+{this.UpgradeAmount} every 10 hp gained";

        public override int BorderColor => Colors.PURPLE;
        public override int FillColor => Colors.ROSE;

        public override void Trigger(Ball ball, string increasedStat, int triggerStatIncrease, int triggerUpgradeDepth)
        {
            var sizeIncrease = (this.UpgradeAmount * triggerStatIncrease)/10;
            ball.IncreaseStat(UpgradeTags.SIZEUPGRADE, sizeIncrease, triggerUpgradeDepth);
            base.Trigger(ball, increasedStat, triggerStatIncrease, triggerUpgradeDepth);
        }
    }
}
