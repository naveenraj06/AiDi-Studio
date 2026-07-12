import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
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
  Boxes,
  Grid3x3,
  KeyRound,
  Lock,
  Plug,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    n: "01",
    icon: Plug,
    title: "Connect an API",
    body: "Paste a URL, import a Postman collection or OpenAPI spec, or drop in a cURL command. GET-only, sandboxed — nothing runs on your infrastructure.",
  },
  {
    n: "02",
    icon: Wand2,
    title: "AI suggests the widget",
    body: "AiDi reads the response shape and recommends a chart type with field mapping already filled in. Accept it, swap the type, or fine-tune colors and legends.",
  },
  {
    n: "03",
    icon: Share2,
    title: "Publish or embed",
    body: "Arrange widgets on a dashboard canvas, then publish with an optional password. Share the link or drop an iframe snippet straight into your product.",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI widget suggestions",
    body: "Every connected resource gets a suggested chart type and field mapping — line, bar, stat, table, donut, or map — based on the shape of its response.",
  },
  {
    icon: Grid3x3,
    title: "Reusable widget library",
    body: "Build a widget once and drop it into as many dashboards as you need. Save any widget as a template for the next resource that looks similar.",
  },
  {
    icon: ShieldCheck,
    title: "GET-only, sandboxed connections",
    body: "Every API resource is read-only in v1 and requests are guarded server-side — no accidental writes, no SSRF into your internal network.",
  },
  {
    icon: Users,
    title: "Roles per project",
    body: "Invite teammates as editors or viewers per project. Owners keep control of billing, connected APIs, and who can publish.",
  },
  {
    icon: Lock,
    title: "Password-protected sharing",
    body: "Publish a dashboard publicly, gate it behind a password, or keep it in draft while you build. Public views never expose your API credentials.",
  },
  {
    icon: Boxes,
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

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "GET-only · sandboxed" },
  { icon: Grid3x3, label: "6 widget types" },
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

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const navBackdropOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const headline = ["Connect any API.", "Ship a dashboard today."];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg-0 text-ink-1">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-transparent px-12 py-[18px]">
        <motion.div
          aria-hidden
          style={{ opacity: navBackdropOpacity }}
          className="absolute inset-0 border-b border-border-subtle bg-bg-0/90 backdrop-blur"
        />
        <div className="relative flex items-center gap-8">
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
        <div className="relative flex items-center gap-5">
          <button onClick={() => navigate("/login")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
            Log in
          </button>
          <Button size="sm" onClick={() => navigate("/signup")}>
            Start free
          </Button>
        </div>
      </div>

      <div className="relative">
        <AuroraBackground />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto mt-[90px] max-w-[760px] px-6 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mb-[26px] inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-bg-1 px-3.5 py-1.5 text-[12px] text-brand-violet-light"
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
                <div className="col-span-2 h-[150px] rounded-lg border border-border-strong bg-bg-2 p-4">
                  <div className="mb-2.5 text-[11px] text-ink-3">MONTHLY REVENUE</div>
                  <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none">
                    <motion.polyline
                      points="0,70 40,55 80,60 120,35 160,42 200,20 240,28 300,10"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.6 }}
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
        <motion.div variants={fadeUp} className="mb-[46px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            How it works
          </div>
          <div className="font-display text-[32px] font-bold">From raw API to shipped dashboard</div>
        </motion.div>
        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent md:block" />
          {STEPS.map((step) => (
            <motion.div
              key={step.n}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="relative rounded-xl border border-border-default bg-bg-1 p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-[13px] font-bold text-brand-violet-light">{step.n}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-brand-violet/30 bg-brand-violet/10 text-brand-violet-light">
                  <step.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mb-2 text-[15px] font-semibold text-ink-1">{step.title}</div>
              <div className="text-[13px] leading-[1.6] text-ink-2">{step.body}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[140px]"
      >
        <motion.div variants={fadeUp} className="mb-[46px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            Features
          </div>
          <div className="font-display text-[32px] font-bold">Everything a data product needs</div>
        </motion.div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="rounded-xl border border-border-default bg-bg-1 p-5"
            >
              <div
                className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-md text-brand-violet-light"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                <f.icon className="h-4 w-4" />
              </div>
              <div className="mb-1.5 text-[14px] font-semibold text-ink-1">{f.title}</div>
              <div className="text-[13px] leading-[1.6] text-ink-2">{f.body}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        id="pricing"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="mx-auto max-w-[1080px] scroll-mt-24 px-6 pt-[140px]"
      >
        <motion.div variants={fadeUp} className="mb-[46px] text-center">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            Pricing
          </div>
          <div className="font-display text-[32px] font-bold">Start free, upgrade when you outgrow it</div>
        </motion.div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {PLANS.map((pl, i) => (
            <motion.div
              key={pl.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
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
            </motion.div>
          ))}
        </div>
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
