using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Dumdum.Pages
{
    public class OctoprotectoModel : PageModel
    {
        public string? RoomId { get; private set; }
        public bool IsDebug { get; private set; } = false;
        public void OnGet([FromQuery] string JoinRoomId)
        {
            if (JoinRoomId != null)
            {
                this.RoomId = JoinRoomId;
            }

#if DEBUG
            IsDebug = true;
#endif
        }
    }
}
