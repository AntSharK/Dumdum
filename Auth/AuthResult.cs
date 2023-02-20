using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;

namespace Dumdum.Auth
{
    public class AuthResult
    {
        public bool IsAuthenticated { get; private set; } = false;
        private readonly string? name;
        private readonly ClaimsIdentity? claimsIdentity;

        private const string SWOLLBALLRATINGCLAIMKEY = "swollballrating";

        public AuthResult(ClaimsIdentity? identity)
        {
            if (identity == null ||
                identity.Claims == null ||
                !identity.IsAuthenticated)
            {
                return;
            }

            this.IsAuthenticated = true;
            this.claimsIdentity = identity;
            this.name = identity.Name;
        }

        public string? Email
        {
            get
            {
                var emailClaim = this.claimsIdentity?.FindFirst(c => c.Type == ClaimTypes.Email);
                if (emailClaim != null)
                {
                    return emailClaim.Value;
                }

                return this.name;
            }
        }

        public int SwollballRating
        {
            get
            {
                var ratingClaim = this.claimsIdentity?.FindFirst(c => c.Type == SWOLLBALLRATINGCLAIMKEY);
                if (ratingClaim != null)
                {
                    return Int32.Parse(ratingClaim.Value);
                }

                return -1;
            }
            set
            {
                var ratingClaim = this.claimsIdentity?.FindFirst(c => c.Type == SWOLLBALLRATINGCLAIMKEY);
                if (ratingClaim != null)
                {
                    this.claimsIdentity?.RemoveClaim(ratingClaim);
                }

                this.claimsIdentity?.AddClaim(new Claim(SWOLLBALLRATINGCLAIMKEY, value.ToString()));
            }
        }
    }
}
