using System.Security.Claims;

namespace Swollball.Auth
{
    public class AuthResult
    {
        public bool IsAuthenticated { get; private set; } = false;
        private readonly string? name;
        private readonly ClaimsIdentity? claimsIdentity;

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
    }
}
