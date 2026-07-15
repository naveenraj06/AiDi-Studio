import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
  CircleDot,
  CreditCard,
  Crown,
  Database,
  GitBranch,
  Grid3x3,
  KeyRound,
  LineChart,
  Lock,
  PieChart,
  Plug,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { WidgetSampleCard } from "@/components/widgets/WidgetSampleCard";
import { WIDGET_GROUPS } from "@/components/widgets/widgetTypeMeta";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    icon: Plug,
    title: "Connect an API",
    body: "Paste a URL, import a Postman collection or OpenAPI spec, or drop in a cURL command. GET-only, sandboxed — nothing runs on your infrastructure.",
    visual: "connect" as const,
  },
  {
    n: "02",
    icon: Wand2,
    title: "AI suggests the widget",
    body: "AiDi reads the response shape and recommends a chart type with field mapping already filled in. Accept it, swap the type, or fine-tune colors and legends.",
    visual: "suggest" as const,
  },
  {
    n: "03",
    icon: Share2,
    title: "Publish or embed",
    body: "Arrange widgets on a dashboard canvas, then publish with an optional password. Share the link or drop an iframe snippet straight into your product.",
    visual: "publish" as const,
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI widget suggestions",
    body: "Every connected resource gets a suggested component and field mapping — from 24 chart, metric, data, and layout types — based on the shape of its response.",
    span: "lg:col-span-3 lg:row-span-2",
    visual: "suggest" as const,
  },
  {
    icon: ShieldCheck,
    title: "GET-only, sandboxed connections",
    body: "Every API resource is read-only in v1 and requests are guarded server-side — no accidental writes, no SSRF into your internal network.",
    span: "lg:col-span-3",
    visual: "shield" as const,
  },
  {
    icon: Grid3x3,
    title: "Reusable widget library",
    body: "Build a widget once and drop it into as many dashboards as you need. Save it as a template for the next similar resource.",
    span: "lg:col-span-2",
    visual: "stack" as const,
  },
  {
    icon: Users,
    title: "Roles per project",
    body: "Invite teammates as editors or viewers. Owners keep control of billing and who can publish.",
    span: "lg:col-span-2",
    visual: "avatars" as const,
  },
  {
    icon: Lock,
    title: "Password-protected sharing",
    body: "Gate a published dashboard behind a password, or keep it in draft while you build.",
    span: "lg:col-span-2",
    visual: "lock" as const,
  },
  {
    icon: Boxes,
    title: "Embed anywhere",
    body: "Every published dashboard ships with an iframe snippet and a raw JSON API, so you can drop live data into your own app or docs.",
    span: "lg:col-span-3",
    visual: "embed" as const,
  },
  {
    icon: SlidersHorizontal,
    title: "Configure every detail",
    body: "Tooltips, legends, gridlines, trend captions, row striping — every component exposes the settings that matter for it, right in the builder.",
    span: "lg:col-span-3",
    visual: "customize" as const,
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    per: "/ forever",
    tagline: "Build and publish, solo",
    features: ["2 projects, 3 published dashboards", "All 22 widget types + AI suggestions", "Public share links & iframe embed"],
  },
  {
    name: "Pro",
    price: "$9",
    per: "/ month",
    tagline: "For the solo builder",
    features: ["Unlimited projects & dashboards", "Bulk import — Postman, OpenAPI, cURL", "Native JS / SDK embed"],
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Org",
    price: "$25",
    per: "/ month",
    tagline: "One org, unlimited members",
    features: ["Everything in Pro", "Unlimited members, flat price", "Shared projects & roles"],
  },
];

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "GET-only · sandboxed" },
  { icon: Grid3x3, label: "24 component types" },
  { icon: Users, label: "Role-based access" },
  { icon: KeyRound, label: "Password-protected shares" },
];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

/** Mouse-tracked 3D tilt wrapper — the hero mockup's "trending 3D" centerpiece. */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 20 });
  const glowX = useTransform(rawX, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(rawY, [-0.5, 0.5], ["0%", "100%"]);
  const glowBackground = useMotionTemplate`radial-gradient(480px circle at ${glowX} ${glowY}, rgba(139,92,246,0.25), transparent 60%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div style={{ perspective: 1400 }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{ background: glowBackground }}
        />
        {children}
      </motion.div>
    </div>
  );
}

function FloatingChip({
  children,
  className,
  delay = 0,
  depth = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  depth?: number;
}) {
  return (
    <motion.div
      className={className}
      style={{ transformStyle: "preserve-3d", translateZ: depth }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: 0.8 + delay },
        scale: { duration: 0.6, delay: 0.8 + delay },
        y: { duration: 4.5, delay: 1.4 + delay, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {children}
    </motion.div>
  );
}

interface ConnectionChipData {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: string;
  color: string;
  className: string;
  delay: number;
  depth: number;
}

/** The actual kinds of resources AiDi connects to — echoes the hero headline
 * ("Connect any API") instead of generic decoration. */
const CONNECTION_CHIPS: ConnectionChipData[] = [
  { icon: CreditCard, label: "Stripe", status: "Synced", color: "#8b5cf6", className: "left-[2%] top-[6%]", delay: 0, depth: 60 },
  { icon: GitBranch, label: "GitHub", status: "Synced", color: "#22d3ee", className: "right-[4%] top-[2%]", delay: 0.35, depth: 90 },
  { icon: Database, label: "Postgres", status: "Live", color: "#34d399", className: "left-[0%] top-[52%]", delay: 0.7, depth: 40 },
  { icon: Plug, label: "REST API", status: "Connected", color: "#f472b6", className: "right-[1%] top-[46%]", delay: 1.05, depth: 70 },
];

/** A floating "connected resource" chip — icon, resource name, and a pulsing live dot —
 * scattered around the hero to make good on "Connect any API" instead of decorating with
 * unrelated logos. */
function ConnectionChip({ icon: Icon, label, status, color, className, delay, depth }: ConnectionChipData) {
  return (
    <FloatingChip delay={delay} depth={depth} className={cn("absolute hidden lg:flex", className)}>
      <div className="flex items-center gap-2 rounded-full border border-border-strong bg-bg-1 py-2 pl-2 pr-3 shadow-lg">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: `${color}22`, color }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold text-ink-1">{label}</span>
          <span className="flex items-center gap-1 text-[9px] text-brand-green">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-brand-green"
            />
            {status}
          </span>
        </div>
      </div>
    </FloatingChip>
  );
}

/** Cursor-follow glow wrapper for grid tiles — a lighter, non-rotating sibling of TiltCard. */
function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(139,92,246,0.16)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(240px circle at ${mx}px ${my}px, ${spotlightColor}, transparent 70%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn("group relative overflow-hidden rounded-xl border border-border-default bg-bg-1", className)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </motion.div>
  );
}

function StepVisual({ kind }: { kind: "connect" | "suggest" | "publish" }) {
  if (kind === "connect") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2.5 font-mono text-[11px] text-ink-3">
        <span className="shrink-0 rounded bg-brand-violet/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-violet-light">
          GET
        </span>
        <span className="truncate">api.stripe.com/v1/charges</span>
        <motion.span
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"
        />
      </div>
    );
  }
  if (kind === "suggest") {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-sunken p-3">
        <div className="mb-2 flex items-center gap-1.5">
          {[LineChart, BarChart3, PieChart].map((Icon, idx) => (
            <div
              key={idx}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded",
                idx === 0 ? "bg-brand-violet/20 text-brand-violet-light" : "text-ink-3",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
          ))}
          <span className="ml-auto text-[10px] font-semibold text-brand-green">92% match</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border-subtle">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan"
            initial={{ width: 0 }}
            whileInView={{ width: "92%" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: EASE_OUT }}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
        <Lock className="h-3 w-3" /> Password
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-brand-green-surface px-2 py-0.5 text-[10px] font-bold text-brand-green">
        <CircleDot className="h-2.5 w-2.5" /> Published
      </div>
    </div>
  );
}

function FeatureVisual({ kind }: { kind: "suggest" | "shield" | "stack" | "avatars" | "lock" | "embed" | "customize" }) {
  if (kind === "customize") {
    return (
      <div className="mt-5 flex flex-col gap-2">
        {["Show tooltip", "Show legend", "Striped rows"].map((label, i) => (
          <div key={label} className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2">
            <span className="text-[11px] text-ink-2">{label}</span>
            <div
              className={cn("h-4 w-7 rounded-full p-0.5 transition-colors", i < 2 ? "bg-brand-violet" : "bg-border-strong")}
            >
              <motion.div
                className="h-3 w-3 rounded-full bg-white"
                animate={{ x: i < 2 ? 12 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "suggest") {
    return (
      <div className="relative mt-5 rounded-lg border border-border-subtle bg-surface-sunken p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          viewport={{ once: true }}
          transition={{
            opacity: { duration: 0.5, delay: 0.6 },
            scale: { duration: 0.5, delay: 0.6 },
            y: { duration: 3.5, delay: 1, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -top-3 right-3 flex items-center gap-1 rounded-full border border-brand-green/30 bg-bg-1 px-2.5 py-1 text-[10px] font-bold text-brand-green shadow-md"
        >
          <Check className="h-3 w-3" /> 92% match
        </motion.div>
        <svg width="100%" height="110" viewBox="0 0 400 110" preserveAspectRatio="none">
          <motion.polyline
            points="0,90 50,70 100,78 150,45 200,55 250,25 300,38 350,15 400,28"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth={3}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.2 }}
          />
        </svg>
        <div className="mt-2 flex items-center gap-2">
          {["Line", "Bar", "Donut"].map((label, idx) => (
            <span
              key={label}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                idx === 0 ? "bg-brand-violet/20 text-brand-violet-light" : "bg-border-subtle text-ink-3",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "shield") {
    return (
      <div className="mt-5 flex items-center gap-2">
        {["GET", "POST", "PUT", "DELETE"].map((m) => (
          <span
            key={m}
            className={cn(
              "rounded px-2 py-1 text-[10px] font-bold",
              m === "GET" ? "bg-brand-green-surface text-brand-green" : "bg-border-subtle text-ink-3 line-through",
            )}
          >
            {m}
          </span>
        ))}
      </div>
    );
  }
  if (kind === "stack") {
    return (
      <div className="relative mt-6 h-14">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute h-12 rounded-lg border border-border-strong bg-bg-2"
            style={{ top: i * 6, left: i * 10, right: 0, opacity: 1 - i * 0.28, zIndex: 3 - i }}
          />
        ))}
      </div>
    );
  }
  if (kind === "avatars") {
    const colors = ["#8b5cf6", "#22d3ee", "#34d399"];
    return (
      <div className="mt-6 flex items-center">
        {colors.map((c, i) => (
          <div
            key={c}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-1 text-[10px] font-bold text-white"
            style={{ background: c, marginLeft: i === 0 ? 0 : -8, zIndex: colors.length - i }}
          >
            {["O", "E", "V"][i]}
          </div>
        ))}
        <span className="ml-3 text-[11px] text-ink-3">Owner · Editor · Viewer</span>
      </div>
    );
  }
  if (kind === "lock") {
    return (
      <motion.div
        whileHover={{ rotate: [0, -8, 8, -4, 0] }}
        transition={{ duration: 0.5 }}
        className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg border border-brand-amber/30 bg-brand-amber/10 text-brand-amber"
      >
        <Lock className="h-4.5 w-4.5" />
      </motion.div>
    );
  }
  return (
    <div className="mt-5 rounded-lg border border-border-subtle bg-surface-sunken px-3.5 py-3 font-mono text-[11px] text-ink-3">
      <span className="text-brand-cyan">{"<iframe "}</span>
      src=<span className="text-brand-green">"aidi.studio/d/abc123"</span>
      <span className="text-brand-cyan">{" />"}</span>
    </div>
  );
}

/** Tab-switched real component previews — a black-active-pill tab bar over a crossfading
 * grid, in the spirit of Kissflow's Workflows/Integrations/Apps showcase. */
function ComponentShowcase() {
  const [active, setActive] = React.useState(WIDGET_GROUPS[0].id);
  const group = WIDGET_GROUPS.find((g) => g.id === active) ?? WIDGET_GROUPS[0];

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {WIDGET_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={cn(
              "cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
              active === g.id ? "bg-ink-1 text-bg-0" : "text-ink-3 hover:text-ink-1",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {group.types.map((t) => (
            <SpotlightCard key={t} className="h-full p-4">
              <WidgetSampleCard type={t} height={150} />
            </SpotlightCard>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AuroraBackground() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 160]);
  const y2 = useTransform(scrollY, [0, 800], [0, -120]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(var(--color-border-strong) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />
      <motion.div
        style={{ y: y1, background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        animate={{ x: [0, 40, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full opacity-40 blur-[110px]"
      />
      <motion.div
        style={{ y: y2, background: "radial-gradient(circle, #22d3ee, transparent 70%)" }}
        animate={{ x: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-32 top-10 h-[480px] w-[480px] rounded-full opacity-30 blur-[100px]"
      />
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/3 top-64 h-[360px] w-[360px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, #34d399, transparent 70%)" }}
      />
    </div>
  );
}

function HowItWorksTimeline() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 75%", "end 55%"] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  return (
    <div ref={containerRef} className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
      <div className="absolute left-[8%] right-[8%] top-11 hidden h-px bg-border-strong md:block">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-brand-violet to-brand-cyan"
          style={{ scaleX: lineScale }}
        />
      </div>
      {STEPS.map((step, i) => (
        <motion.div
          key={step.n}
          variants={fadeUp}
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className={cn("relative", i === 1 && "md:mt-9")}
        >
          <div className="relative overflow-hidden rounded-xl border border-border-default bg-bg-1 p-6">
            <div
              aria-hidden
              className="font-display pointer-events-none absolute -right-2 -top-7 select-none text-[100px] font-extrabold leading-none text-border-subtle"
            >
              {step.n}
            </div>
            <div className="relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-violet/30 bg-brand-violet/10 text-brand-violet-light">
              <step.icon className="h-5 w-5" />
            </div>
            <div className="relative z-10 mb-1.5 text-[15px] font-semibold text-ink-1">{step.title}</div>
            <div className="relative z-10 mb-4 text-[13px] leading-[1.6] text-ink-2">{step.body}</div>
            <div className="relative z-10">
              <StepVisual kind={step.visual} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const headline = ["Connect any API.", "Ship a dashboard today."];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg-0 text-ink-1">
      <div className="sticky top-4 z-20 flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="flex w-full max-w-[1080px] items-center justify-between gap-8 rounded-full border border-border-subtle bg-bg-1/95 px-6 py-3 shadow-lg backdrop-blur"
        >
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5">
              <div
                className="h-7 w-7 rounded-lg"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }}
              />
              <div className="font-display text-[17px] font-bold">AiDi Studio</div>
            </div>
            <div className="hidden items-center gap-7 md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-[13px] text-ink-2 outline-none hover:text-ink-1">
                  Product
                  <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px]">
                  <DropdownMenuItem onClick={() => scrollTo("how-it-works")}>How it works</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollTo("demo")}>Live demo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollTo("features")}>Features</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button onClick={() => navigate("/components")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
                Components
              </button>
              <button onClick={() => scrollTo("pricing")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
                Pricing
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/login")} className="hidden cursor-pointer text-[13px] text-ink-2 hover:text-ink-1 sm:inline">
              Log in
            </button>
            <Button size="sm" className="rounded-full px-5" onClick={() => navigate("/signup")}>
              Get Started
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="relative">
        <AuroraBackground />

        {CONNECTION_CHIPS.map((chip) => (
          <ConnectionChip key={chip.label} {...chip} />
        ))}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto mt-[90px] max-w-[760px] px-6 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mb-[26px] inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-md"
            style={{ background: "linear-gradient(115deg, #8b5cf6, #ec4899, #f59e0b)" }}
          >
            <motion.span
              animate={{ rotate: [0, 20, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </motion.span>
            API-first analytics, no pipeline required
          </motion.div>

          <div className="font-display text-[56px] font-extrabold leading-[1.08] tracking-[-0.02em]">
            {headline.map((line, i) => (
              <motion.div key={line} variants={fadeUp} className="overflow-hidden">
                {i === 1 ? (
                  <>
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
                  </>
                ) : (
                  line
                )}
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="mt-[22px] text-[17px] leading-[1.6] text-ink-2">
            AiDi suggests the right widget and maps your schema automatically. Compose reusable widgets into
            dashboards, then publish as an embeddable data product.
          </motion.div>

          <motion.div variants={fadeUp} className="mt-[34px] flex justify-center gap-3">
            <Button size="default" onClick={() => navigate("/signup")} className="group px-[26px] py-[13px] text-[14px]">
              Start free — no card required
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate("/login")}
              className="px-[26px] py-[13px] text-[14px]"
            >
              Log in
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-[42px] flex max-w-[560px] flex-wrap items-center justify-center gap-x-6 gap-y-2.5"
          >
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="flex items-center gap-1.5 text-[12px] text-ink-3">
                <h.icon className="h-3.5 w-3.5 text-brand-violet-light" />
                {h.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative mx-auto mt-[90px] max-w-[1080px] px-6">
          <TiltCard>
            <div
              className="rounded-2xl border border-border-default bg-bg-1 p-2.5"
              style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
            >
              <div className="grid grid-cols-4 gap-3.5 rounded-lg bg-surface-sunken p-6">
                <div className="col-span-2 rounded-lg border border-border-strong bg-bg-2 p-4">
                  <WidgetSampleCard type="line" height={100} />
                </div>
                <div className="rounded-lg border border-border-strong bg-bg-2 p-4">
                  <WidgetSampleCard type="stat" height={100} />
                </div>
                <div className="rounded-lg border border-border-strong bg-bg-2 p-4">
                  <WidgetSampleCard type="donut" height={100} />
                </div>
                <div className="col-span-4 rounded-lg border border-border-strong bg-bg-2 p-4">
                  <WidgetSampleCard type="table" height={90} />
                </div>
              </div>
            </div>
          </TiltCard>

          <FloatingChip
            depth={70}
            className="absolute -left-6 top-10 hidden rounded-xl border border-border-strong bg-bg-1/90 px-4 py-3 shadow-lg backdrop-blur lg:block"
          >
            <div className="flex items-center gap-2 text-[12px]">
              <Wand2 className="h-3.5 w-3.5 text-brand-violet-light" />
              <span className="text-ink-1">Widget suggested</span>
            </div>
          </FloatingChip>

          <FloatingChip
            delay={0.4}
            depth={90}
            className="absolute -right-8 bottom-16 hidden rounded-xl border border-border-strong bg-bg-1/90 px-4 py-3 shadow-lg backdrop-blur lg:block"
          >
            <div className="flex items-center gap-2 text-[12px]">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
              <span className="text-ink-1">Sandboxed &amp; read-only</span>
            </div>
          </FloatingChip>
        </div>
      </div>

      <motion.div
        id="how-it-works"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[140px]"
      >
        <motion.div variants={fadeUp} className="mb-[56px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            How it works
          </div>
          <div className="font-display text-[32px] font-bold">From raw API to shipped dashboard</div>
        </motion.div>
        <HowItWorksTimeline />
      </motion.div>

      <ProductDemo />

      <motion.div
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[140px]"
      >
        <motion.div variants={fadeUp} className="mb-[56px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            Features
          </div>
          <div className="font-display text-[32px] font-bold">Everything a data product needs</div>
        </motion.div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className={f.span}>
              <SpotlightCard className="h-full p-5">
                <div
                  className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-md text-brand-violet-light"
                  style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)" }}
                >
                  <f.icon className="h-4 w-4" />
                </div>
                <div className="mb-1.5 text-[14px] font-semibold text-ink-1">{f.title}</div>
                <div className="text-[13px] leading-[1.6] text-ink-2">{f.body}</div>
                <div className="flex-1" />
                <FeatureVisual kind={f.visual} />
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[140px]"
      >
        <motion.div variants={fadeUp} className="mb-[56px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            Component library
          </div>
          <div className="font-display text-[32px] font-bold">24 components, ready to drop in</div>
          <div className="mx-auto mt-2.5 max-w-[520px] text-[14px] leading-[1.6] text-ink-2">
            Charts, metrics, data, and layout components — each one binds to a live resource, exposes its own
            settings (tooltips, legends, trend indicators, and more), and works as a standalone dashboard tile.
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <ComponentShowcase />
        </motion.div>
        <motion.div variants={fadeUp} className="mt-[34px] text-center">
          <Button variant="outline" onClick={() => navigate("/components")} className="group px-[22px] py-[11px] text-[13px]">
            Browse all 24 components
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        id="pricing"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[140px]"
      >
        <motion.div variants={fadeUp} className="mb-[56px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            Pricing
          </div>
          <div className="font-display text-[32px] font-bold">Start free, upgrade when you outgrow it</div>
        </motion.div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:items-center">
          {PLANS.map((pl) => (
            <motion.div
              key={pl.name}
              variants={fadeUp}
              whileHover={{ y: pl.highlight ? -10 : -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={cn("relative rounded-xl border p-6", pl.highlight ? "z-10 border-brand-violet lg:scale-[1.07]" : "border-border-default")}
              style={{
                background: pl.highlight
                  ? "linear-gradient(160deg, var(--color-surface-selected), var(--color-bg-1))"
                  : "var(--color-bg-1)",
                boxShadow: pl.highlight ? "0 24px 60px rgba(139,92,246,0.28)" : undefined,
              }}
            >
              {pl.badge && (
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan px-3 py-1 text-[10px] font-bold text-white shadow-md"
                >
                  <Crown className="h-3 w-3" /> {pl.badge}
                </motion.div>
              )}
              <div className="text-[13px] font-bold text-ink-1">{pl.name}</div>
              <div className="mt-1 text-[11px] text-ink-3">{pl.tagline}</div>
              <div className="font-display my-3 text-[28px] font-extrabold text-ink-1">
                {pl.price}
                <span className="text-[12px] font-normal text-ink-3">{pl.per}</span>
              </div>
              <div className="flex flex-col gap-2">
                {pl.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-[12px] text-ink-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-brand-green" /> {feat}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} className="mt-9 text-center">
          <Button variant="outline" onClick={() => navigate("/pricing")} className="group px-[22px] py-[11px] text-[13px]">
            Compare all plans in detail
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        className="mx-auto mt-[140px] max-w-[880px] px-6 pb-[110px] text-center"
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-border-default px-10 py-[54px]"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(34,211,238,0.08))" }}
        >
          <motion.div
            aria-hidden
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-16 -top-16 h-[220px] w-[220px] rounded-full blur-[80px]"
            style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)" }}
          />
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
      </motion.div>

      <div className="flex flex-col gap-4 border-t border-border-default px-12 py-10 text-[12px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <div>© 2026 AiDi Studio</div>
        <div className="flex gap-5">
          <button onClick={() => scrollTo("how-it-works")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            How it works
          </button>
          <button onClick={() => scrollTo("demo")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            Live demo
          </button>
          <button onClick={() => scrollTo("features")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            Features
          </button>
          <button onClick={() => navigate("/components")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            Components
          </button>
          <button onClick={() => scrollTo("pricing")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            Pricing
          </button>
          <button onClick={() => navigate("/terms")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            Terms
          </button>
          <button onClick={() => navigate("/privacy")} className="cursor-pointer text-ink-3 hover:text-ink-2">
            Privacy
          </button>
        </div>
      </div>
    </div>
  );
}
