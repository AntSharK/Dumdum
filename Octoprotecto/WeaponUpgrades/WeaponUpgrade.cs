using Common.Util;

namespace Octoprotecto
{
    public abstract class WeaponUpgrade
    {
        public abstract string DisplayName { get; set; }
        public abstract string Description { get; set; }

        public virtual int BorderColor { get; } = Colors.BLACK;

        public virtual int FillColor { get; } = Colors.WHITE;
    }
}
