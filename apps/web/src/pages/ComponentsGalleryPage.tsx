import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme } from "@/store/uiSlice";
import { WIDGET_GROUPS } from "@/components/widgets/widgetTypeMeta";
import { WidgetSampleCard } from "@/components/widgets/WidgetSampleCard";
import { cn } from "@/lib/utils";

function ThemeSwitch() {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-bg-1 p-1">
      <button
        onClick={() => dispatch(setTheme("light"))}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
          theme === "light" ? "bg-bg-3 text-ink-1" : "text-ink-3 hover:text-ink-1",
        )}
      >
        <Sun className="h-3.5 w-3.5" /> Light
      </button>
      <button
        onClick={() => dispatch(setTheme("dark"))}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
          theme === "dark" ? "bg-bg-3 text-ink-1" : "text-ink-3 hover:text-ink-1",
        )}
      >
        <Moon className="h-3.5 w-3.5" /> Dark
      </button>
    </div>
  );
}

/** Public, unauthenticated marketing page — every widget type rendered with sample data
 * so prospects can see the full component catalog (and try both themes) before signing up. */
export default function ComponentsGalleryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-0 text-ink-1">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-bg-0/90 px-12 py-[18px] backdrop-blur">
        <div onClick={() => navigate("/landing")} className="flex cursor-pointer items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg" style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }} />
          <div className="font-display text-[16px] font-bold">AiDi Studio</div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitch />
          <button onClick={() => navigate("/login")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
            Log in
          </button>
          <Button size="sm" onClick={() => navigate("/signup")}>
            Start free
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-6 pb-[110px] pt-[70px]">
        <div className="mb-[64px] text-center">
          <div
            onClick={() => navigate("/landing")}
            className="mb-5 inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-ink-3 hover:text-ink-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </div>
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-violet-light">
            Component library
          </div>
          <div className="font-display text-[40px] font-bold leading-[1.15]">24 components, one design system</div>
          <div className="mx-auto mt-3.5 max-w-[560px] text-[15px] leading-[1.6] text-ink-2">
            Charts, metrics, data, and layout components — every one ready to bind to a live API resource or drop
            onto a dashboard as-is. Flip the theme switch above to see how they hold up in light and dark.
          </div>
        </div>

        {WIDGET_GROUPS.map((group) => (
          <div key={group.id} className="mb-[60px]">
            <div className="mb-1 text-[13px] font-bold uppercase tracking-[0.03em] text-ink-1">{group.label}</div>
            <div className="mb-5 text-[13px] text-ink-3">{group.description}</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {group.types.map((t) => (
                <div key={t} className="rounded-xl border border-border-default bg-bg-1 p-4">
                  <WidgetSampleCard type={t} height={170} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          className="mt-[16px] rounded-2xl border border-border-default px-10 py-[54px] text-center"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(34,211,238,0.08))" }}
        >
          <div className="font-display text-[26px] font-bold">Ready to build with these?</div>
          <div className="mx-auto mt-2 max-w-[420px] text-[14px] leading-[1.6] text-ink-2">
            Connect an API and start dropping these components onto a dashboard in minutes.
          </div>
          <div className="mt-6">
            <Button onClick={() => navigate("/signup")} className="px-[26px] py-[13px] text-[14px]">
              Start free — no card required
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
