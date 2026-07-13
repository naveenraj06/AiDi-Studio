import * as React from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronRight,
  Cloud,
  Copy,
  GitFork,
  Grid3x3,
  LineChart,
  Lock,
  PieChart,
  Plug,
  Share2,
  Table2,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type ChartType = "line" | "bar" | "donut" | "table";

interface DemoField {
  key: string;
  sample: string;
}

interface DemoResource {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  latencyMs: number;
  fields: DemoField[];
  mapping: { field: string; role: string }[];
  data: { label: string; value: number }[];
  suggestions: { type: ChartType; confidence: number }[];
}

const RESOURCES: DemoResource[] = [
  {
    id: "stripe",
    name: "Stripe Payments",
    icon: Grid3x3,
    url: "api.stripe.com/v1/charges",
    latencyMs: 118,
    fields: [
      { key: "amount", sample: "4999" },
      { key: "currency", sample: '"usd"' },
      { key: "created", sample: '"2026-06-30"' },
      { key: "customer.email", sample: '"jane@acme.co"' },
    ],
    mapping: [
      { field: "created", role: "X-axis" },
      { field: "amount", role: "Y-axis" },
    ],
    data: [
      { label: "W1", value: 32 },
      { label: "W2", value: 41 },
      { label: "W3", value: 38 },
      { label: "W4", value: 55 },
      { label: "W5", value: 49 },
      { label: "W6", value: 68 },
    ],
    suggestions: [
      { type: "line", confidence: 92 },
      { type: "bar", confidence: 71 },
      { type: "table", confidence: 48 },
    ],
  },
  {
    id: "github",
    name: "GitHub Repo Stats",
    icon: GitFork,
    url: "api.github.com/repos/vercel/next.js",
    latencyMs: 84,
    fields: [
      { key: "stargazers_count", sample: "128430" },
      { key: "open_issues", sample: "312" },
      { key: "forks", sample: "26100" },
      { key: "date", sample: '"2026-06-30"' },
    ],
    mapping: [
      { field: "date", role: "X-axis" },
      { field: "stargazers_count", role: "Y-axis" },
    ],
    data: [
      { label: "Feb", value: 28 },
      { label: "Mar", value: 34 },
      { label: "Apr", value: 40 },
      { label: "May", value: 46 },
      { label: "Jun", value: 58 },
      { label: "Jul", value: 64 },
    ],
    suggestions: [
      { type: "bar", confidence: 88 },
      { type: "line", confidence: 80 },
      { type: "donut", confidence: 36 },
    ],
  },
  {
    id: "weather",
    name: "OpenWeather Current",
    icon: Cloud,
    url: "api.openweathermap.org/data/2.5/weather",
    latencyMs: 62,
    fields: [
      { key: "main.temp", sample: "24.3" },
      { key: "main.humidity", sample: "61" },
      { key: "wind.speed", sample: "12.4" },
      { key: "name", sample: '"Bengaluru"' },
    ],
    mapping: [
      { field: "main.temp", role: "Value" },
      { field: "main.humidity", role: "Value" },
      { field: "wind.speed", role: "Value" },
    ],
    data: [
      { label: "Temp", value: 24 },
      { label: "Humidity", value: 61 },
      { label: "Wind", value: 12 },
    ],
    suggestions: [
      { type: "donut", confidence: 90 },
      { type: "table", confidence: 65 },
      { type: "bar", confidence: 50 },
    ],
  },
];

const CHART_META: Record<ChartType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  line: { label: "Line", icon: LineChart },
  bar: { label: "Bar", icon: BarChart3 },
  donut: { label: "Donut", icon: PieChart },
  table: { label: "Table", icon: Table2 },
};

const DONUT_COLORS = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24"];

const STEPS = [
  { key: "connect", label: "Connect", icon: Plug },
  { key: "map", label: "Map fields", icon: Share2 },
  { key: "suggest", label: "AI suggests", icon: Wand2 },
  { key: "publish", label: "Publish", icon: Lock },
] as const;

const panelVariants: Variants = {
  enter: { opacity: 0, x: 16 },
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2, ease: EASE_OUT } },
};

function DemoChart({ type, resource }: { type: ChartType; resource: DemoResource }) {
  const max = Math.max(...resource.data.map((d) => d.value));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="flex h-full min-h-[190px] items-center justify-center"
      >
        {type === "line" && (
          <svg width="100%" height="150" viewBox="0 0 300 150" preserveAspectRatio="none">
            <motion.polyline
              points={resource.data
                .map((d, i) => `${(i / (resource.data.length - 1)) * 300},${140 - (d.value / max) * 120}`)
                .join(" ")}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            />
            {resource.data.map((d, i) => (
              <circle
                key={d.label}
                cx={(i / (resource.data.length - 1)) * 300}
                cy={140 - (d.value / max) * 120}
                r={3.5}
                fill="#8b5cf6"
              />
            ))}
          </svg>
        )}

        {type === "bar" && (
          <div className="flex h-[150px] w-full items-end justify-between gap-2 px-2">
            {resource.data.map((d, i) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-violet to-brand-cyan"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / max) * 120}px` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: EASE_OUT }}
                />
                <span className="text-[9px] text-ink-3">{d.label}</span>
              </div>
            ))}
          </div>
        )}

        {type === "donut" && (
          <div className="flex items-center gap-6">
            <svg width="130" height="130" viewBox="0 0 42 42">
              <circle r="15.9" cx="21" cy="21" fill="transparent" stroke="var(--color-border-strong)" strokeWidth={5} />
              {(() => {
                const total = resource.data.reduce((s, d) => s + d.value, 0);
                let offset = 0;
                return resource.data.map((d, i) => {
                  const pct = (d.value / total) * 100;
                  const seg = (
                    <motion.circle
                      key={d.label}
                      r="15.9"
                      cx="21"
                      cy="21"
                      fill="transparent"
                      stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                      strokeWidth={5}
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeDashoffset={25 - offset}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    />
                  );
                  offset += pct;
                  return seg;
                });
              })()}
            </svg>
            <div className="flex flex-col gap-1.5">
              {resource.data.map((d, i) => (
                <div key={d.label} className="flex items-center gap-1.5 text-[11px] text-ink-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                  />
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "table" && (
          <div className="w-full overflow-hidden rounded-lg border border-border-subtle">
            <div className="grid grid-cols-2 bg-bg-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-ink-3">
              <div>Field</div>
              <div>Sample</div>
            </div>
            {resource.fields.map((f) => (
              <div
                key={f.key}
                className="grid grid-cols-2 border-t border-border-subtle px-3 py-2 font-mono text-[11px] text-ink-2"
              >
                <div className="truncate text-brand-violet-light">{f.key}</div>
                <div className="truncate">{f.sample}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function ProductDemo() {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [resourceId, setResourceId] = React.useState<string>(RESOURCES[0].id);
  const [chartType, setChartType] = React.useState<ChartType>(RESOURCES[0].suggestions[0].type);
  const [protectShare, setProtectShare] = React.useState(false);
  const [published, setPublished] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const resource = RESOURCES.find((r) => r.id === resourceId) ?? RESOURCES[0];
  const step = STEPS[stepIndex];

  const selectResource = (id: string) => {
    setResourceId(id);
    const next = RESOURCES.find((r) => r.id === id);
    if (next) setChartType(next.suggestions[0].type);
    setPublished(false);
  };

  const goTo = (i: number) => setStepIndex(Math.max(0, Math.min(STEPS.length - 1, i)));

  const copySnippet = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div id="demo" className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[140px]">
      <div className="mb-[20px] text-center">
        <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
          Try it yourself
        </div>
        <div className="font-display text-[32px] font-bold">Pick an API, watch AiDi do the rest</div>
        <div className="mx-auto mt-2.5 max-w-[480px] text-[13px] leading-[1.6] text-ink-2">
          This is a simulated walkthrough of the real product flow — click through the steps below with sample
          data, no signup required.
        </div>
      </div>

      {/* Step pills */}
      <div className="relative mx-auto mb-6 flex max-w-[560px] items-center justify-between">
        <div className="absolute left-5 right-5 top-5 h-px bg-border-default">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-brand-violet to-brand-cyan"
            animate={{ scaleX: stepIndex / (STEPS.length - 1) }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          />
        </div>
        {STEPS.map((s, i) => {
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <button
              key={s.key}
              onClick={() => goTo(i)}
              className="relative z-10 flex cursor-pointer flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border text-[13px] font-bold transition-colors",
                  active
                    ? "border-brand-violet bg-brand-violet text-white"
                    : done
                      ? "border-brand-violet/50 bg-brand-violet/15 text-brand-violet-light"
                      : "border-border-strong bg-bg-1 text-ink-3",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className={cn("text-[11px]", active ? "font-semibold text-ink-1" : "text-ink-3")}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Demo panel */}
      <div
        className="overflow-hidden rounded-2xl border border-border-default bg-bg-1"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="border-b border-border-default p-6 lg:border-b-0 lg:border-r">
            <AnimatePresence mode="wait">
              <motion.div key={step.key} variants={panelVariants} initial="enter" animate="center" exit="exit">
                {step.key === "connect" && (
                  <>
                    <div className="mb-3 text-[13px] font-semibold text-ink-1">Choose a sample API</div>
                    <div className="flex flex-col gap-2">
                      {RESOURCES.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => selectResource(r.id)}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                            r.id === resourceId
                              ? "border-brand-violet bg-brand-violet/10"
                              : "border-border-default hover:border-border-strong",
                          )}
                        >
                          <r.icon className="h-4 w-4 shrink-0 text-brand-violet-light" />
                          <span className="text-[12px] font-medium text-ink-1">{r.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[11px] text-ink-3">
                      <span className="shrink-0 rounded bg-brand-violet/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-violet-light">
                        GET
                      </span>
                      <span className="truncate">{resource.url}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-green">
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className="h-1.5 w-1.5 rounded-full bg-brand-green"
                      />
                      200 OK · {resource.latencyMs}ms
                    </div>
                  </>
                )}

                {step.key === "map" && (
                  <>
                    <div className="mb-3 text-[13px] font-semibold text-ink-1">
                      Schema detected from {resource.name}
                    </div>
                    <div className="flex flex-col gap-2">
                      {resource.fields.map((f) => {
                        const mapped = resource.mapping.find((m) => m.field === f.key);
                        return (
                          <div
                            key={f.key}
                            className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2 font-mono text-[11px]"
                          >
                            <span className="truncate text-ink-2">{f.key}</span>
                            <ChevronRight className="h-3 w-3 shrink-0 text-ink-3" />
                            {mapped ? (
                              <span className="ml-auto shrink-0 rounded-full bg-brand-violet/15 px-2 py-0.5 text-[10px] font-bold text-brand-violet-light">
                                {mapped.role}
                              </span>
                            ) : (
                              <span className="ml-auto shrink-0 text-[10px] text-ink-3">unused</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {step.key === "suggest" && (
                  <>
                    <div className="mb-3 text-[13px] font-semibold text-ink-1">AiDi's suggested chart types</div>
                    <div className="flex flex-col gap-2">
                      {resource.suggestions.map((s) => {
                        const meta = CHART_META[s.type];
                        const active = chartType === s.type;
                        return (
                          <button
                            key={s.type}
                            onClick={() => setChartType(s.type)}
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                              active ? "border-brand-violet bg-brand-violet/10" : "border-border-default hover:border-border-strong",
                            )}
                          >
                            <meta.icon
                              className={cn("h-4 w-4 shrink-0", active ? "text-brand-violet-light" : "text-ink-3")}
                            />
                            <span className="text-[12px] font-medium text-ink-1">{meta.label} chart</span>
                            <span
                              className={cn(
                                "ml-auto text-[11px] font-semibold",
                                s.confidence >= 80 ? "text-brand-green" : "text-ink-3",
                              )}
                            >
                              {s.confidence}% match
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step.key === "publish" && (
                  <>
                    <div className="mb-3 text-[13px] font-semibold text-ink-1">Publish your dashboard</div>
                    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-[12px] text-ink-2">
                        <Lock className="h-3.5 w-3.5" /> Password protect
                      </div>
                      <Switch checked={protectShare} onCheckedChange={setProtectShare} />
                    </div>

                    {!published ? (
                      <Button className="mt-4 w-full" onClick={() => setPublished(true)}>
                        Publish dashboard
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-lg border border-border-subtle bg-surface-sunken p-3"
                      >
                        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand-green">
                          <Check className="h-3.5 w-3.5" /> Published{protectShare ? " · password required" : ""}
                        </div>
                        <button
                          onClick={copySnippet}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border-subtle bg-bg-0 px-2.5 py-2 text-left font-mono text-[10px] text-ink-3 transition-colors hover:border-border-strong"
                        >
                          <span className="truncate">{`<iframe src="aidi.studio/d/${resource.id}-demo" />`}</span>
                          <Copy className="ml-auto h-3 w-3 shrink-0" />
                        </button>
                        {copied && <div className="mt-1.5 text-[10px] text-brand-green">Copied to clipboard</div>}
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-center bg-surface-sunken p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] text-ink-3">Live preview</span>
              <span className="rounded-full bg-brand-violet/15 px-2 py-0.5 text-[10px] font-bold text-brand-violet-light">
                {CHART_META[chartType].label}
              </span>
            </div>
            <div className="rounded-xl border border-border-strong bg-bg-2 p-4">
              <DemoChart type={chartType} resource={resource} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => goTo(stepIndex - 1)} disabled={stepIndex === 0}>
          Back
        </Button>
        {stepIndex < STEPS.length - 1 ? (
          <Button size="sm" onClick={() => goTo(stepIndex + 1)}>
            Next: {STEPS[stepIndex + 1].label}
          </Button>
        ) : (
          <span className="text-[12px] text-ink-3">That's the whole flow — try it with your own API.</span>
        )}
      </div>
    </div>
  );
}
