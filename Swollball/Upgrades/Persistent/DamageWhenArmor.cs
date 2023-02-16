﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swollball.Upgrades
{
    public class DamageWhenArmor : BasePersistentUpgrade
    {
        public DamageWhenArmor(int value, int cost, string name, int duration) : base(value, cost, name, duration)
        {
            this.Tags.Add(UpgradeTags.UPGRADEMODIFIER);
            this.Tags.Add(UpgradeTags.DAMAGEUPGRADE);
        }

        public override string Description => $"Damage+{this.UpgradeAmount} every armor gained.";

        public override int BorderColor => 16759756; // FFBBCC
        public override int FillColor => 15395562; // EAEAEA

        public override void AfterUpgrade(Player player)
        {
            var ball = player.Ball;
            if (ball.Armor > this.preUpgradeStat)
            {
                ball.Dmg = ball.Dmg + (ball.Armor - this.preUpgradeStat) * this.UpgradeAmount;
            }
        }

        public override void BeforeUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Armor;
        }
        public override void PerformUpgrade(Player player)
        {
            this.preUpgradeStat = player.Ball.Armor;
            base.PerformUpgrade(player);
        }
    }
}
