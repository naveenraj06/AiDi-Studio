// Providers anyone can sign up for regardless of employer — creating an Org
// requires a domain that isn't on this list, since Org membership is granted
// by matching email domain (see routes/orgs.ts, routes/team.ts).
export const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
  "aol.com",
  "live.com",
  "mail.com",
]);

export function isBusinessEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain);
}
