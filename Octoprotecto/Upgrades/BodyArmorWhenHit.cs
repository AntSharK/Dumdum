namespace Octoprotecto
{
    public class BodyArmorWhenHit : Upgrade<Octopus>
    {
        public override string DisplayName => "Toughen";
        public override string Description => "Increases armor by 1 for the round when you are hit.";
        public override int UpgradeBaseCost => 8;
        public override int UpgradeIncrementCost => 2;
        public override string UpgradeName => "toughen";

        public override void ApplyUpgrade(Octopus octopus)
        {
            octopus.TrackedUpgrades.Add(this);
            base.ApplyUpgrade(octopus);
        }
    }
}
