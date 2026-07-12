import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    n: "01",
    title: "Connect an API",
    body: "Paste a URL, import a Postman collection or OpenAPI spec, or drop in a cURL command. GET-only, sandboxed — nothing runs on your infrastructure.",
  },
  {
    n: "02",
    title: "AI suggests the widget",
    body: "AiDi reads the response shape and recommends a chart type with field mapping already filled in. Accept it, swap the type, or fine-tune colors and legends.",
  },
  {
    n: "03",
    title: "Publish or embed",
    body: "Arrange widgets on a dashboard canvas, then publish with an optional password. Share the link or drop an iframe snippet straight into your product.",
  },
];

const FEATURES = [
  {
    icon: "✦",
    title: "AI widget suggestions",
    body: "Every connected resource gets a suggested chart type and field mapping — line, bar, stat, table, donut, or map — based on the shape of its response.",
  },
  {
    icon: "▦",
    title: "Reusable widget library",
    body: "Build a widget once and drop it into as many dashboards as you need. Save any widget as a template for the next resource that looks similar.",
  },
  {
    icon: "⇄",
    title: "GET-only, sandboxed connections",
    body: "Every API resource is read-only in v1 and requests are guarded server-side — no accidental writes, no SSRF into your internal network.",
  },
  {
    icon: "◔",
    title: "Roles per project",
    body: "Invite teammates as editors or viewers per project. Owners keep control of billing, connected APIs, and who can publish.",
  },
  {
    icon: "🔒",
    title: "Password-protected sharing",
    body: "Publish a dashboard publicly, gate it behind a password, or keep it in draft while you build. Public views never expose your API credentials.",
  },
  {
    icon: "⧉",
    title: "Embed anywhere",
    body: "Every published dashboard ships with an iframe snippet and a raw JSON API, so you can drop live data into your own app or docs.",
  },
];

const PLANS = [
  { name: "Free", price: "$0", limits: "1 project · 3 dashboards · 10 widgets" },
  { name: "Pro", price: "$29", limits: "5 projects · unlimited dashboards/widgets" },
  { name: "Team", price: "$49", limits: "Unlimited projects · roles · priority support" },
  { name: "Enterprise", price: "Custom", limits: "SSO/SAML · audit logs · dedicated support" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-bg-0 text-ink-1">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-bg-0/90 px-12 py-[18px] backdrop-blur">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-lg"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }}
            />
            <div className="font-display text-[16px] font-bold">AiDi Studio</div>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <button onClick={() => scrollTo("how-it-works")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
              How it works
            </button>
            <button onClick={() => scrollTo("features")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
              Features
            </button>
            <button onClick={() => scrollTo("pricing")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
              Pricing
            </button>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => navigate("/login")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
            Log in
          </button>
          <Button size="sm" onClick={() => navigate("/signup")}>
            Start free
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-[90px] max-w-[760px] px-6 text-center">
        <div className="mb-[26px] inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-bg-1 px-3.5 py-1.5 text-[12px] text-brand-violet-light">
          <span>✦</span> API-first analytics, no pipeline required
        </div>
        <div className="font-display text-[56px] font-extrabold leading-[1.08] tracking-[-0.02em]">
          Connect any API.
          <br />
          Ship a dashboard{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            today.
          </span>
        </div>
        <div className="mt-[22px] text-[17px] leading-[1.6] text-ink-2">
          AiDi suggests the right widget and maps your schema automatically. Compose reusable widgets into
          dashboards, then publish as an embeddable data product.
        </div>
        <div className="mt-[34px] flex justify-center gap-3">
          <Button size="default" onClick={() => navigate("/signup")} className="px-[26px] py-[13px] text-[14px]">
            Start free — no card required
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => navigate("/login")}
            className="px-[26px] py-[13px] text-[14px]"
          >
            Log in
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-[90px] max-w-[1080px] px-6">
        <div
          className="rounded-2xl border border-border-default bg-bg-1 p-2.5"
          style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
        >
          <div className="grid grid-cols-4 gap-3.5 rounded-lg bg-surface-sunken p-6">
            <div className="col-span-2 h-[150px] rounded-lg border border-border-strong bg-bg-2 p-4">
              <div className="mb-2.5 text-[11px] text-ink-3">MONTHLY REVENUE</div>
              <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none">
                <polyline
                  points="0,70 40,55 80,60 120,35 160,42 200,20 240,28 300,10"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
              </svg>
            </div>
            <div className="rounded-lg border border-border-strong bg-bg-2 p-4">
              <div className="text-[11px] text-ink-3">ACTIVE USERS</div>
              <div className="font-display mt-2.5 text-[30px] font-bold">18.2k</div>
              <div className="mt-1 text-[11px] text-brand-green">▲ 12.4%</div>
            </div>
            <div className="flex items-center justify-center rounded-lg border border-border-strong bg-bg-2 p-4">
              <svg width="80" height="80" viewBox="0 0 42 42">
                <circle r="15.9" cx="21" cy="21" fill="transparent" stroke="var(--color-border-strong)" strokeWidth={6} />
                <circle
                  r="15.9"
                  cx="21"
                  cy="21"
                  fill="transparent"
                  stroke="#22d3ee"
                  strokeWidth={6}
                  strokeDasharray="60 100"
                  strokeDashoffset={25}
                />
                <circle
                  r="15.9"
                  cx="21"
                  cy="21"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth={6}
                  strokeDasharray="25 100"
                  strokeDashoffset={-35}
                />
              </svg>
            </div>
            <div className="col-span-4 flex gap-6 rounded-lg border border-border-strong bg-bg-2 px-4 py-3.5">
              <div className="text-[12px] text-ink-3">Region</div>
              <div className="text-[12px] text-ink-3">Signups</div>
              <div className="text-[12px] text-ink-3">Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <div id="how-it-works" className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[120px]">
        <div className="mb-[46px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            How it works
          </div>
          <div className="font-display text-[32px] font-bold">From raw API to shipped dashboard</div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-xl border border-border-default bg-bg-1 p-6">
              <div className="font-display mb-3 text-[13px] font-bold text-brand-violet-light">{step.n}</div>
              <div className="mb-2 text-[15px] font-semibold text-ink-1">{step.title}</div>
              <div className="text-[13px] leading-[1.6] text-ink-2">{step.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="features" className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[120px]">
        <div className="mb-[46px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            Features
          </div>
          <div className="font-display text-[32px] font-bold">Everything a data product needs</div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border-default bg-bg-1 p-5">
              <div
                className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-md text-[16px]"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                {f.icon}
              </div>
              <div className="mb-1.5 text-[14px] font-semibold text-ink-1">{f.title}</div>
              <div className="text-[13px] leading-[1.6] text-ink-2">{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="pricing" className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[120px]">
        <div className="mb-[46px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            Pricing
          </div>
          <div className="font-display text-[32px] font-bold">Start free, upgrade when you outgrow it</div>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {PLANS.map((pl, i) => (
            <div
              key={pl.name}
              className="rounded-xl border p-[18px]"
              style={{
                background: i === 1 ? "var(--color-surface-selected)" : "var(--color-bg-1)",
                borderColor: i === 1 ? "var(--color-brand-violet)" : "var(--color-border-default)",
              }}
            >
              <div className="text-[13px] font-bold text-ink-1">{pl.name}</div>
              <div className="font-display my-2 text-[22px] font-extrabold text-ink-1">
                {pl.price}
                {pl.price !== "Custom" && <span className="text-[12px] font-normal text-ink-3">/seat</span>}
              </div>
              <div className="text-[11px] leading-[1.6] text-ink-2">{pl.limits}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-[120px] max-w-[880px] px-6 pb-[110px] text-center">
        <div
          className="rounded-2xl border border-border-default px-10 py-[54px]"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(34,211,238,0.08))" }}
        >
          <div className="font-display text-[28px] font-bold">Ready to ship your first dashboard?</div>
          <div className="mx-auto mt-2.5 max-w-[440px] text-[14px] leading-[1.6] text-ink-2">
            Connect an API and let AiDi suggest the widget — most teams have a published dashboard within
            minutes of signing up.
          </div>
          <div className="mt-[26px] flex justify-center gap-3">
            <Button size="default" onClick={() => navigate("/signup")} className="px-[26px] py-[13px] text-[14px]">
              Start free — no card required
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-default px-12 py-10 text-[12px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <div>© 2026 AiDi Studio</div>
        <div className="flex gap-5">
          <button onClick={() => scrollTo("how-it-works")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            How it works
          </button>
          <button onClick={() => scrollTo("features")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            Features
          </button>
          <button onClick={() => scrollTo("pricing")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            Pricing
          </button>
          <a href="#" className="text-ink-3 hover:text-ink-2">
            Terms
          </a>
          <a href="#" className="text-ink-3 hover:text-ink-2">
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
}
