using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Dumdum.Pages
{
    public class IndexModel : PageModel
    {
        public string BuildNumber => "vBeta 0.219.2000";

        public void OnGet()
        {
        }
    }
}
