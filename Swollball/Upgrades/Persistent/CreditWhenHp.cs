﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class CreditWhenHp : BasePersistentUpgrade
    {
        public CreditWhenHp(int value, int cost, string name) : base(value, cost, name)
        {
            this.Tags.Add(UpgradeTags.UPGRADEMODIFIER);
        }

        public override string Description => $"Gain {this.UpgradeAmount} credit when you gain HP.";

        public override int BorderColor => 43775; // 00AAFF
        public override int FillColor => 11259375; // ABCDEF

        public override void AfterUpgrade(Player player)
        {
            var ball = player.Ball;
            if (ball.Hp > this.preUpgradeStat)
            {
                player.Economy.CreditsLeft++;
            }
        }

        public override void BeforeUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Hp;
        }

        public override void PerformUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Hp;
            base.PerformUpgrade(player);
        }
    }
}
