import * as React from "react";
import { useNavigate } from "react-router-dom";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-0 p-6 text-ink-1">
      <div className="w-full max-w-[400px]">
        <div
          className="mb-[30px] flex cursor-pointer items-center justify-center gap-2.5"
          onClick={() => navigate("/landing")}
        >
          <div className="h-[26px] w-[26px] rounded-[7px]" style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }} />
          <div className="font-display text-[15px] font-bold">AiDi Studio</div>
        </div>

        <div className="rounded-[14px] border border-border-default bg-bg-1 p-[30px]">{children}</div>
      </div>
    </div>
  );
}
