import { Link } from "react-router-dom";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { sampleTimeSeries } from "@/data/widgets";
import { Sparkles, Check, ArrowRight } from "lucide-react";

const chips = [
  { label: "AI Powered", color: "text-brand-violetLight" },
  { label: "Reusable Components", color: "text-brand-cyan" },
  { label: "Secure & Scalable", color: "text-brand-green" },
];

const steps = [
  { n: "1", t: "Connect API", s: "Paste endpoint, set auth" },
  { n: "2", t: "Build widgets", s: "AI picks component, maps schema" },
  { n: "3", t: "Compose dashboard", s: "Drag widgets, customize layout" },
  { n: "4", t: "Publish", s: "Embed anywhere or share link" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-0">
      <nav className="flex h-14 items-center justify-between border-b border-border px-6">
        <Logo size={22} />
        <div className="hidden items-center gap-6 text-sm text-ink-2 md:flex">
          <span>Product</span>
          <span>Solutions</span>
          <span>Pricing</span>
          <span>Docs</span>
          <span>Company</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="outline" size="sm">Log in</Button></Link>
          <Link to="/login"><Button size="sm">Get Started Free</Button></Link>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-brand-violet/8 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-brand-cyan/6 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-brand-violet/12 px-3 py-1.5 text-xs font-medium text-brand-violetLight">
              <Sparkles className="h-3 w-3" /> AI-native analytics platform
            </div>
            <h1 className="text-4xl font-bold leading-tight text-ink-1 md:text-5xl">
              Build intelligent.<br />
              <span className="text-brand-violet">Embed anywhere.</span>
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-2">
              Connect any API, let AI build the right widget, and publish live dashboards
              you can embed anywhere — no backend required.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c.label} className={`inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1 text-xs font-medium ${c.color}`}>
                  <Check className="h-3 w-3" /> {c.label}
                </span>
              ))}
            </div>
            <div className="mt-7 flex gap-3">
              <Link to="/login"><Button size="lg">Get Started Free</Button></Link>
              <Button size="lg" variant="secondary">View Demo</Button>
            </div>
            <div className="mt-10 border-t border-border pt-5">
              <div className="text-xs text-ink-3 mb-2">Trusted by modern teams</div>
              <div className="flex gap-6 text-sm font-medium text-ink-3">
                <span>Acme</span><span>Globex</span><span>Initech</span><span>Soylent</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-1 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between rounded-md bg-bg-2 px-3 py-2">
              <span className="text-xs font-medium text-ink-1">Executive Overview</span>
              <Badge variant="green">● Live</Badge>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[
                { l: "Total Revenue", v: "$98,346", d: "+12.4%" },
                { l: "Active Users", v: "12,438", d: "+8.2%" },
                { l: "Conversion", v: "3.8%", d: "-0.4%" },
              ].map((s) => (
                <div key={s.l} className="rounded-md border border-border bg-bg-2 p-3">
                  <div className="text-[10px] text-ink-3">{s.l}</div>
                  <div className="mt-1 text-lg font-bold text-ink-1">{s.v}</div>
                  <div className={`text-[10px] font-medium ${s.d.startsWith("-") ? "text-brand-red" : "text-brand-green"}`}>{s.d}</div>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-border bg-bg-2 p-3">
              <div className="mb-1 text-xs font-medium text-ink-2">Revenue trend</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={sampleTimeSeries}>
                  <Line type="monotone" dataKey="revenue" stroke="#7D5AFF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bg-1 px-6 py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-violet/12 text-sm font-semibold text-brand-violetLight">
                {s.n}
              </div>
              <div className="text-sm font-medium text-ink-1">{s.t}</div>
              <div className="mt-1 text-xs text-ink-3">{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-10 text-center">
        <Link to="/app/projects" className="inline-flex items-center gap-1 text-sm font-medium text-brand-violetLight hover:underline">
          Explore the app <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
