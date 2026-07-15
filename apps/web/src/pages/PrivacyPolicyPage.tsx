import { LegalDoc } from "@/components/marketing/LegalDoc";

export default function PrivacyPolicyPage() {
  return (
    <LegalDoc
      eyebrow="legal / privacy"
      title="Privacy Policy"
      updated="[DATE]"
      crossLink={{ label: "Terms of Service", to: "/terms" }}
      notice={
        <>
          Template notice: this document is a starting draft, not legal advice. Confirm every disclosure
          matches your live infrastructure, fill in the [BRACKETED] placeholders, and have it reviewed by a
          qualified lawyer — especially if you serve users in the EU/EEA, UK, or California.
        </>
      }
    >
      <h2>1. Who We Are</h2>
      <p>
        AiDi Studio ("we", "us") is operated by [LEGAL NAME], [ADDRESS / COUNTRY]. This policy explains what
        personal data we collect when you use AiDi Studio, why, and the choices you have. Contact:{" "}
        <a href="mailto:[PRIVACY EMAIL]">[PRIVACY EMAIL]</a>.
      </p>

      <h2>2. Data We Collect</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Examples</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Account data</strong>
            </td>
            <td>Email address, display name, hashed password (managed by our auth provider)</td>
            <td>Sign-in, account recovery, service emails</td>
          </tr>
          <tr>
            <td>
              <strong>Org data</strong>
            </td>
            <td>Org name, member emails, roles, verified email domain</td>
            <td>Team collaboration and access control</td>
          </tr>
          <tr>
            <td>
              <strong>API Resource configuration</strong>
            </td>
            <td>Resource names, endpoint URLs, auth type, and the API credentials/tokens you save</td>
            <td>Fetching your APIs on your behalf to render widgets</td>
          </tr>
          <tr>
            <td>
              <strong>Your Content</strong>
            </td>
            <td>Projects, widgets, dashboard layouts, publish settings, share passwords</td>
            <td>Providing the core product</td>
          </tr>
          <tr>
            <td>
              <strong>Fetched API data</strong>
            </td>
            <td>Responses returned by the APIs you connect</td>
            <td>
              Rendered to display your widgets; proxied live, not stored as a copy of record [CONFIRM if
              caching is added later]
            </td>
          </tr>
          <tr>
            <td>
              <strong>Billing data</strong>
            </td>
            <td>Plan, subscription status; card details are collected and stored by Stripe, never by us</td>
            <td>Payments for Pro / Org plans</td>
          </tr>
          <tr>
            <td>
              <strong>Technical data</strong>
            </td>
            <td>IP address, browser type, request logs</td>
            <td>Security, rate limiting, debugging</td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not intentionally collect special-category data. Do not connect APIs containing data you are
        not permitted to process, and avoid storing broad-scope credentials with us.
      </p>

      <h2>3. How We Use Data</h2>
      <ul>
        <li>To provide, secure, and improve the Service (legal basis: contract performance and legitimate interests).</li>
        <li>To process payments and manage subscriptions (contract performance).</li>
        <li>
          To send transactional emails — verification, password reset, billing notices (contract
          performance). We do not send marketing email without separate consent.
        </li>
        <li>To comply with law and enforce our Terms (legal obligation / legitimate interests).</li>
      </ul>
      <p>We do not sell personal data, and we do not use Your Content or your API data to train AI models.</p>

      <h2>4. AI Features — What Leaves Our Systems</h2>
      <p>
        When you request an AI widget suggestion, we send a <strong>sample of the selected API Resource's
        response</strong> (plus the resource's name and field structure) to our AI inference provider,{" "}
        <strong>Groq, Inc.</strong>, to generate a widget-type and field-mapping suggestion. This happens only
        when you trigger the suggestion feature. If no AI key is configured or the AI call fails, a
        deterministic on-server fallback runs instead and nothing is sent to Groq. The Service always labels
        which path produced a suggestion. Per Groq's API terms, submitted data is used to provide the
        inference service; review Groq's current data-use terms at their site. Do not use the AI suggestion
        feature on API responses containing personal or confidential data you cannot share with a processor.
      </p>

      <h2>5. Service Providers (Sub-processors)</h2>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Role</th>
            <th>Data involved</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>Database &amp; authentication</td>
            <td>Account data, Org data, Your Content, API Resource configuration (incl. stored credentials)</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Application hosting &amp; CDN</td>
            <td>Technical data (IPs, request logs); all traffic transits their infrastructure</td>
          </tr>
          <tr>
            <td>Groq</td>
            <td>AI inference (widget suggestions)</td>
            <td>API response samples you submit for suggestion (see §4)</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Payment processing</td>
            <td>Billing details, card data (held by Stripe under their own policy)</td>
          </tr>
          <tr>
            <td>[EMAIL PROVIDER, e.g. Resend]</td>
            <td>Transactional email</td>
            <td>Email address, message content</td>
          </tr>
        </tbody>
      </table>
      <p>
        These providers may store data in the United States or other countries. Where required, transfers
        rely on appropriate safeguards such as Standard Contractual Clauses. [CONFIRM your Supabase project
        region and state it here, e.g., "Our primary database is hosted in the AWS ___ region."]
      </p>

      <h2>6. Published Dashboards Are Public</h2>
      <p>
        When you publish a dashboard, anyone with the link (and password, if you set one) can view it —
        including any data your connected APIs return to it. Embedded dashboards are visible on the sites you
        embed them into. Publishing is your choice and your responsibility; unpublishing removes public access
        but copies already viewed by others cannot be recalled.
      </p>

      <h2>7. Retention</h2>
      <ul>
        <li>
          Account data and Your Content: kept while your account is active; deleted within [30] days of
          account deletion, except minimal records we must keep (e.g., invoices, for tax law).
        </li>
        <li>API credentials: deleted immediately when you remove the resource or your account.</li>
        <li>Server logs: retained up to [30–90] days for security and debugging.</li>
        <li>Billing records: retained as required by tax and accounting law.</li>
      </ul>

      <h2>8. Security</h2>
      <p>
        Data in transit is encrypted with TLS; data at rest is encrypted by our database provider. Access to
        production systems is restricted to the operator. API credentials are stored for the sole purpose of
        fetching your resources — grant tokens with the narrowest possible scope. No system is perfectly
        secure; if a breach affecting your personal data occurs, we will notify you as required by law.
      </p>

      <h2>9. Your Rights</h2>
      <p>
        Depending on where you live (including under the GDPR, UK GDPR, India's DPDP Act, or the CCPA), you
        may have the right to access, correct, export, delete, or restrict the processing of your personal
        data, and to object to certain processing. You can delete your account and content from Settings, or
        exercise any right by emailing <a href="mailto:[PRIVACY EMAIL]">[PRIVACY EMAIL]</a>. You also have
        the right to complain to your local data-protection authority.
      </p>

      <h2>10. Cookies</h2>
      <p>
        We use only strictly necessary cookies/local storage: your session token and interface preferences.
        We do not use advertising or cross-site tracking cookies. [UPDATE this section if you add analytics —
        name the tool and its cookies.]
      </p>

      <h2>11. Children</h2>
      <p>
        The Service is not directed to children under 16, and we do not knowingly collect their data. If you
        believe a child has provided us personal data, contact us and we will delete it.
      </p>

      <h2>12. Changes</h2>
      <p>
        We will post any changes here and update the date above; for material changes we will notify you by
        email or in-app at least 14 days in advance.
      </p>

      <h2>13. Contact</h2>
      <p>
        Privacy questions or requests: <a href="mailto:[PRIVACY EMAIL]">[PRIVACY EMAIL]</a>.
      </p>
    </LegalDoc>
  );
}
