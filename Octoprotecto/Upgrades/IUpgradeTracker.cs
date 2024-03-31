namespace Octoprotecto
{
    public interface IUpgradeTracker<T>
    {
        int UpgradesCreated { get; set; }
        int UpgradesApplied { get; set; }
        string Name { get; }
        HashSet<T> TrackedUpgrades { get; }
        Dictionary<string, T> PurchasableUpgrades { get; }

    }
}
