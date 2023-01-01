﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class SizeUpgrade : BaseUpgrade
    {
        public SizeUpgrade(int value, int cost) : base(value, cost)
        {
        }

        public override string UpgradeName => $"Grow+";

        public override string Description => $"Increases size by {this.UpgradeAmount}";

        public override void PerformUpgrade(Ball ball)
        {
            ball.SizeMultiplier += this.UpgradeAmount * 0.01f;
            ball.Upgrades.Add(this);
        }

    }
}
