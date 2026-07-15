import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Mode = "solo" | "team";

interface Feature {
  text: React.ReactNode;
  dim?: boolean;
}

const FREE_FEATURES: Feature[] = [
  { text: <><strong>Unlimited API resources</strong>, added manually</> },
  { text: <>All <strong>22 widget types</strong> + AI suggestions</> },
  { text: <>Up to <strong>2 projects</strong>, <strong>3 published dashboards</strong></> },
  { text: "Public share links & password protection" },
  { text: "Embed anywhere via iframe" },
  { text: "Bulk import & SDK embed", dim: true },
  { text: "Collaboration", dim: true },
];

const PAID_PLANS: Record<
  Mode,
  {
    tile: string;
    badge: string;
    name: string;
    sub: string;
    price: string;
    per: string;
    note: string;
    features: Feature[];
    cta: string;
  }
> = {
  solo: {
    tile: "plan / pro",
    badge: "most popular",
    name: "Pro",
    sub: "For the solo builder shipping serious dashboards — remove every limit.",
    price: "$9",
    per: "/ month",
    note: "flat rate · cancel anytime",
    features: [
      { text: <><strong>Everything in Free</strong>, plus:</> },
      { text: <><strong>Bulk import</strong> your API library — Postman, OpenAPI, cURL</> },
      { text: <><strong>Unlimited projects</strong> & published dashboards</> },
      { text: <><strong>Native JS / SDK embed</strong> — no iframes, feels built-in</> },
      { text: "Collaboration — that's what Org is for →", dim: true },
    ],
    cta: "Go Pro",
  },
  team: {
    tile: "plan / org",
    badge: "for teams",
    name: "Org",
    sub: "One org for your whole team. Everyone builds together in shared projects.",
    price: "$25",
    per: "/ month",
    note: "flat rate per org · unlimited members",
    features: [
      { text: <><strong>Everything in Pro</strong>, plus:</> },
      { text: <><strong>Unlimited members</strong> — flat price, never per-seat</> },
      { text: <><strong>Shared projects</strong> — everyone edits the same dashboards</> },
      { text: <><strong>Roles</strong> — owner, editor, viewer per member</> },
      { text: <>Create with your <strong>company email</strong> · invite anyone, any domain</> },
    ],
    cta: "Create your Org",
  },
};

const RULES = [
  {
    k: "rule 01",
    title: "Viewing is always free",
    body: "Anyone can view a published dashboard on any plan — link, password, or iframe.",
  },
  {
    k: "rule 02",
    title: "Building together needs an Org",
    body: "Two people can never edit the same project outside an Org. Solo plans are truly solo.",
  },
  {
    k: "rule 03",
    title: "One Org per domain included",
    body: "Creating an Org requires a company email. Need a separate Org? Each one is its own $25/mo subscription.",
  },
];

const COMPARE_ROWS: { feature: string; free: string; pro: string; org: string }[] = [
  { feature: "Price", free: "$0", pro: "$9/mo", org: "$25/mo" },
  { feature: "API resources (manual add)", free: "Unlimited", pro: "Unlimited", org: "Unlimited" },
  { feature: "Widget types + AI suggestion", free: "All 22", pro: "All 22", org: "All 22" },
  { feature: "Projects", free: "2", pro: "Unlimited", org: "Unlimited" },
  { feature: "Published dashboards", free: "3", pro: "Unlimited", org: "Unlimited" },
  { feature: "Public links & iframe embed", free: "✓", pro: "✓", org: "✓" },
  { feature: "Bulk import (Postman / OpenAPI / cURL)", free: "—", pro: "✓", org: "✓" },
  { feature: "JS / SDK embed", free: "—", pro: "✓", org: "✓" },
  { feature: "Members", free: "1", pro: "1", org: "Unlimited" },
  { feature: "Collaborate on projects", free: "—", pro: "—", org: "✓ org-wide" },
  { feature: "Roles (owner / editor / viewer)", free: "—", pro: "—", org: "✓" },
  { feature: "Org creation", free: "—", pro: "—", org: "Company email" },
];

function compareCellClass(value: string) {
  if (value === "—") return "text-ink-3 opacity-45";
  if (value.includes("✓") || value === "Unlimited" || value === "All 22") return "font-semibold text-brand-green";
  return "";
}

function FeatureList({ features }: { features: Feature[] }) {
  return (
    <ul className="my-6 flex flex-1 flex-col gap-2.5">
      {features.map((f, i) => (
        <li
          key={i}
          className={cn(
            "flex items-start gap-2.5 text-[14.5px] leading-[1.45]",
            f.dim ? "text-ink-3 opacity-70" : "text-ink-2",
          )}
        >
          {f.dim ? (
            <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" />
          )}
          <span>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<Mode>("solo");
  const paid = PAID_PLANS[mode];

  return (
    <div className="min-h-screen bg-bg-0 text-ink-1">
      <MarketingHeader />

      <div className="mx-auto max-w-[1000px] px-6 pb-[100px] pt-[64px]">
        <section className="pb-[52px] text-center">
          <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">
            <span className="text-brand-violet-light">Free</span> to build.
            <br />
            <span className="text-brand-violet-light">Free</span> to share.
          </h1>
          <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-[1.55] text-ink-2">
            Connect any API, build dashboards with AI-suggested widgets, and publish them to the world —
            without paying a cent. Pay only to power up, or to build together.
          </p>
        </section>

        <section className="grid grid-cols-1 items-stretch gap-[22px] md:grid-cols-2">
          {/* Free — constant */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-border-default bg-bg-1 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-subtle bg-bg-2 px-[18px] py-[11px]">
              <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">plan / free</span>
              <span className="flex h-3.5 items-end gap-[2.5px]">
                {[5, 9, 6, 12, 8].map((h, i) => (
                  <i key={i} className="block w-[3.5px] rounded-[1px] bg-border-strong" style={{ height: h }} />
                ))}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-[26px]">
              <div className="font-display text-[24px] font-bold tracking-[-0.02em]">Free</div>
              <p className="mt-[5px] min-h-[44px] text-[14.5px] leading-[1.5] text-ink-2">
                Everything you need to build and publish real dashboards, solo.
              </p>
              <div className="mb-1 mt-5 flex items-baseline gap-[7px]">
                <span className="font-mono text-[44px] font-semibold tracking-[-0.03em]">$0</span>
                <span className="font-mono text-[14px] text-ink-3">/ forever</span>
              </div>
              <div className="min-h-[18px] font-mono text-[12px] text-ink-3">no card required</div>
              <FeatureList features={FREE_FEATURES} />
              <Button variant="outline" className="mt-auto w-full" onClick={() => navigate("/signup")}>
                Start building
              </Button>
            </div>
          </div>

          {/* Paid — morphs between Pro and Org */}
          <div
            className="flex flex-col overflow-hidden rounded-xl border bg-bg-1"
            style={{
              borderColor: "var(--color-brand-violet)",
              boxShadow: "0 0 0 1px var(--color-brand-violet), 0 12px 34px rgba(139,92,246,0.18)",
            }}
          >
            <div className="flex items-center justify-between border-b border-border-subtle bg-bg-2 px-[18px] py-[11px]">
              <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">{paid.tile}</span>
              <span className="rounded-full bg-brand-violet/15 px-[9px] py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-brand-violet-light">
                {paid.badge}
              </span>
            </div>

            <div className="px-[18px] pt-4">
              <div
                role="tablist"
                aria-label="Who is this plan for"
                className="relative flex w-full rounded-[11px] border border-border-strong bg-bg-0 p-[3px]"
              >
                {(["solo", "team"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "relative z-10 flex-1 cursor-pointer rounded-lg py-[9px] text-[13.5px] font-semibold transition-colors",
                      mode === m ? "text-white" : "text-ink-2",
                    )}
                  >
                    {m === "solo" ? "For individuals" : "For teams"}
                    {mode === m && (
                      <motion.span
                        layoutId="pricing-toggle-thumb"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 -z-10 rounded-lg bg-brand-violet"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="flex flex-1 flex-col p-[26px]"
              >
                <div className="font-display text-[24px] font-bold tracking-[-0.02em]">{paid.name}</div>
                <p className="mt-[5px] min-h-[44px] text-[14.5px] leading-[1.5] text-ink-2">{paid.sub}</p>
                <div className="mb-1 mt-5 flex items-baseline gap-[7px]">
                  <span className="font-mono text-[44px] font-semibold tracking-[-0.03em]">{paid.price}</span>
                  <span className="font-mono text-[14px] text-ink-3">{paid.per}</span>
                </div>
                <div className="min-h-[18px] font-mono text-[12px] text-ink-3">{paid.note}</div>
                <FeatureList features={paid.features} />
                <Button className="mt-auto w-full" onClick={() => navigate("/signup")}>
                  {paid.cta}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <section className="mt-[46px] grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RULES.map((r) => (
            <div key={r.k} className="rounded-xl border border-dashed border-border-strong bg-bg-1/70 p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.07em] text-brand-violet-light">{r.k}</div>
              <div className="mt-1 mb-0.5 text-[13px] font-semibold text-ink-1">{r.title}</div>
              <div className="text-[13.5px] leading-[1.55] text-ink-2">{r.body}</div>
            </div>
          ))}
        </section>

        <section className="mt-[74px]">
          <h2 className="font-display mb-7 text-center text-[26px] font-bold tracking-[-0.02em]">Compare plans</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead className="text-center">Free</TableHead>
                <TableHead className="text-center">Pro</TableHead>
                <TableHead className="text-center">Org</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARE_ROWS.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell>{row.feature}</TableCell>
                  <TableCell className={cn("text-center font-mono", compareCellClass(row.free))}>{row.free}</TableCell>
                  <TableCell className={cn("text-center font-mono", compareCellClass(row.pro))}>{row.pro}</TableCell>
                  <TableCell className={cn("text-center font-mono", compareCellClass(row.org))}>{row.org}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <footer className="mt-[70px] text-center font-mono text-[13px] text-ink-3">
          free to build · free to share · pay to power up · pay to build together
        </footer>
      </div>
    </div>
  );
}
