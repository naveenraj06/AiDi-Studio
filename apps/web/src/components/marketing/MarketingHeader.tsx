import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/** Shared sticky header for standalone marketing/legal pages (pricing, privacy, terms) —
 * mirrors the logo + auth actions used on the landing and components-gallery pages. */
export function MarketingHeader() {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-bg-0/90 px-6 py-[18px] backdrop-blur sm:px-12">
      <div onClick={() => navigate("/landing")} className="flex cursor-pointer items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg" style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }} />
        <div className="font-display text-[16px] font-bold">AiDi Studio</div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/login")} className="cursor-pointer text-[13px] text-ink-2 hover:text-ink-1">
          Log in
        </button>
        <Button size="sm" onClick={() => navigate("/signup")}>
          Start free
        </Button>
      </div>
    </div>
  );
}
