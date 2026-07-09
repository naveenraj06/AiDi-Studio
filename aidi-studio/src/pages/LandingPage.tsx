import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-0 text-ink-1">
      <div className="flex items-center justify-between px-12 py-[22px]">
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-7 rounded-lg"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }}
          />
          <div className="font-display text-[16px] font-bold">AiDi Studio</div>
        </div>
        <div className="flex items-center gap-5">
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="text-[13px] text-ink-2">
            Log in
          </a>
          <div
            onClick={() => navigate("/signup")}
            className="cursor-pointer rounded-lg bg-brand-violet px-[18px] py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-brand-violet-dark"
          >
            Start free
          </div>
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
          <div
            onClick={() => navigate("/signup")}
            className="cursor-pointer rounded-[9px] bg-brand-violet px-[26px] py-[13px] text-[14px] font-semibold text-white transition-colors hover:bg-brand-violet-dark"
          >
            Start free — no card required
          </div>
          <div
            onClick={() => navigate("/login")}
            className="cursor-pointer rounded-[9px] border border-border-strong bg-bg-1 px-[26px] py-[13px] text-[14px] font-semibold text-ink-1 transition-colors hover:bg-bg-2"
          >
            Log in
          </div>
        </div>
      </div>

      <div className="mx-auto mt-[90px] max-w-[1080px] px-6 pb-[100px]">
        <div
          className="rounded-2xl border border-border-default bg-bg-1 p-2.5"
          style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
        >
          <div className="grid grid-cols-4 gap-3.5 rounded-[10px] bg-surface-sunken p-6">
            <div className="col-span-2 h-[150px] rounded-[10px] border border-border-strong bg-bg-2 p-4">
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
            <div className="rounded-[10px] border border-border-strong bg-bg-2 p-4">
              <div className="text-[11px] text-ink-3">ACTIVE USERS</div>
              <div className="font-display mt-2.5 text-[30px] font-bold">18.2k</div>
              <div className="mt-1 text-[11px] text-brand-green">▲ 12.4%</div>
            </div>
            <div className="flex items-center justify-center rounded-[10px] border border-border-strong bg-bg-2 p-4">
              <svg width="80" height="80" viewBox="0 0 42 42">
                <circle r="15.9" cx="21" cy="21" fill="transparent" stroke="#232330" strokeWidth={6} />
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
            <div className="col-span-4 flex gap-6 rounded-[10px] border border-border-strong bg-bg-2 px-4 py-3.5">
              <div className="text-[12px] text-ink-3">Region</div>
              <div className="text-[12px] text-ink-3">Signups</div>
              <div className="text-[12px] text-ink-3">Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between border-t border-border-default px-12 py-10 text-[12px] text-ink-3">
        <div>© 2026 AiDi Studio</div>
        <div className="flex gap-5">
          <a href="#" className="text-ink-3">
            Terms
          </a>
          <a href="#" className="text-ink-3">
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
}
