import { LegalDoc } from "@/components/marketing/LegalDoc";

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="legal / terms"
      title="Terms of Service"
      updated="[DATE]"
      crossLink={{ label: "Privacy Policy", to: "/privacy" }}
    >
      <h2>1. Agreement</h2>
      <p>
        These Terms of Service ("Terms") govern your use of AiDi Studio (the "Service"), operated by [LEGAL
        NAME / SOLE PROPRIETOR NAME] ("we", "us"). By creating an account or using the Service, you agree to
        these Terms. If you are using the Service on behalf of an organization, you confirm you have
        authority to bind that organization.
      </p>

      <h2>2. The Service</h2>
      <p>
        AiDi Studio lets you connect external APIs ("API Resources"), build dashboards and widgets from their
        data, and publish or embed those dashboards. Some features use AI models to suggest widget
        configurations. We may add, change, or remove features at any time; if a change materially reduces a
        paid feature you rely on, you may cancel and receive a pro-rated refund for the unused period.
      </p>

      <h2>3. Accounts &amp; Organizations</h2>
      <ul>
        <li>
          You must provide accurate account information and keep your credentials secure. You are responsible
          for activity under your account.
        </li>
        <li>
          Creating an Organization ("Org") requires a company-domain email address. One Org may be created per
          verified domain per subscription; each additional Org requires its own subscription.
        </li>
        <li>
          Org owners control membership and roles. Content created inside an Org belongs to the Org's
          subscription holder for administrative purposes.
        </li>
        <li>You must be at least 16 years old (or the age of digital consent in your country) to use the Service.</li>
      </ul>

      <h2>4. Plans, Billing &amp; Cancellation</h2>
      <ul>
        <li>
          <strong>Free</strong> includes limited projects and published dashboards as described on the
          pricing page.
        </li>
        <li>
          <strong>Pro ($9/month)</strong> and <strong>Org ($25/month per Org)</strong> are billed in advance
          on a monthly cycle via our payment processor (Stripe). Prices exclude applicable taxes.
        </li>
        <li>
          You can cancel anytime; access continues until the end of the paid period. Downgrading may
          re-apply Free-tier limits — content over the limit is retained but may become read-only until you
          reduce usage or resubscribe.
        </li>
        <li>We may change prices with at least 30 days' notice; changes apply from your next billing cycle.</li>
      </ul>

      <h2>5. Your Content &amp; API Credentials</h2>
      <ul>
        <li>
          You retain all rights to the dashboards, widgets, and configurations you create, and to the data
          returned by your API Resources ("Your Content"). We claim no ownership of it.
        </li>
        <li>
          You grant us a limited license to host, process, display, and transmit Your Content solely to
          operate the Service — including fetching your API Resources on your behalf and rendering public
          dashboards you choose to publish.
        </li>
        <li>You are responsible for having the right to connect any API you add, including complying with that API provider's terms.</li>
        <li>
          API credentials you store with us are used only to fetch your resources. Keep the scope of any
          tokens you provide as narrow as possible.
        </li>
      </ul>

      <h2>6. AI Features</h2>
      <p>
        When you request an AI widget suggestion, a sample of the selected API Resource's response is sent to
        a third-party AI provider to generate the suggestion. Suggestions are automated guesses and may be
        wrong; review them before relying on them. If AI is unavailable, a deterministic (non-AI) fallback is
        used, and the Service labels which one produced the result. Do not use the AI features to process
        data you are not permitted to share with a processor (see the Privacy Policy for details).
      </p>

      <h2>7. Published &amp; Embedded Dashboards</h2>
      <ul>
        <li>
          Publishing a dashboard makes it accessible to anyone with the link (and password, if set). You are
          solely responsible for what you publish and for any data it exposes.
        </li>
        <li>
          Embedding (iframe or SDK) places your dashboard on third-party sites you control or are permitted to
          use. You are responsible for compliance on those sites.
        </li>
        <li>We may unpublish content that violates these Terms or applicable law.</li>
      </ul>

      <h2>8. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Service to violate any law, third-party right, or API provider's terms;</li>
        <li>
          publish dashboards containing unlawful, infringing, or deceptive content, or personal data you have
          no right to display;
        </li>
        <li>
          probe, overload, or disrupt the Service, other users, or the APIs you connect (including using us
          to circumvent an API's rate limits or access controls);
        </li>
        <li>attempt to access other users' accounts, data, or non-public areas of the Service;</li>
        <li>resell or white-label the Service itself without our written permission (embedding your own dashboards is of course allowed).</li>
      </ul>

      <h2>9. Availability &amp; Support</h2>
      <p>
        The Service is provided on an "as available" basis without an uptime guarantee. We rely on
        third-party infrastructure (hosting, database, AI, and payment providers) and are not liable for
        their outages. Support is provided on a reasonable-efforts basis via [SUPPORT EMAIL].
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. Dashboards visualize data
        from APIs you choose; we do not verify the accuracy of that data and it must not be your sole basis
        for financial, medical, legal, or other consequential decisions.
      </p>

      <h2>11. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR EXEMPLARY DAMAGES, OR FOR LOST PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR
        ANY CLAIM IS LIMITED TO THE AMOUNTS YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM AROSE (OR $50 IF YOU
        PAID NOTHING). Some jurisdictions do not allow certain limitations, so parts of this section may not
        apply to you.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may delete your account at any time from Settings. We may suspend or terminate accounts that
        violate these Terms, with notice where practicable. On termination we will make Your Content
        available for export for [30] days unless legal reasons prevent it.
      </p>

      <h2>13. Changes to These Terms</h2>
      <p>
        We may update these Terms. For material changes we will give at least 14 days' notice by email or
        in-app. Continued use after the effective date constitutes acceptance.
      </p>

      <h2>14. Governing Law</h2>
      <p>
        These Terms are governed by the laws of [JURISDICTION, e.g., India], without regard to conflict-of-law
        rules. Courts of [CITY/STATE] have exclusive jurisdiction, except where mandatory consumer law in your
        country provides otherwise.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms: <a href="mailto:[SUPPORT EMAIL]">[SUPPORT EMAIL]</a>.
      </p>
    </LegalDoc>
  );
}
