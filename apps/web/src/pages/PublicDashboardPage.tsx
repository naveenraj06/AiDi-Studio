import * as React from "react";
import { useParams } from "react-router-dom";
import { usePublicDashboard } from "@/hooks/usePublicDashboard";
import { ApiError } from "@/lib/api";
import { TYPE_COLOR } from "@/components/widgets/widgetTypeMeta";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

function NotAvailable() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2.5 bg-bg-0 text-ink-1">
      <div className="text-[34px]">🔒</div>
      <div className="font-display text-[18px] font-bold">This dashboard isn't available</div>
      <div className="text-[13px] text-ink-3">It may be unpublished, or the link is incorrect.</div>
    </div>
  );
}

export default function PublicDashboardPage() {
  const { slug } = useParams<{ slug: string }>();

  const [pw, setPw] = React.useState("");
  const [submittedPassword, setSubmittedPassword] = React.useState<string | undefined>(undefined);
  const [wrongPassword, setWrongPassword] = React.useState(false);

  const { data: dashboard, isLoading, error } = usePublicDashboard(slug, submittedPassword);

  const locked = error instanceof ApiError && error.status === 401;
  const notFound = error instanceof ApiError && error.status !== 401;

  const onUnlock = () => {
    if (!pw) return;
    setWrongPassword(!!submittedPassword);
    setSubmittedPassword(pw);
  };

  React.useEffect(() => {
    if (dashboard) setWrongPassword(false);
  }, [dashboard]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-0">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-brand-violet" />
      </div>
    );
  }

  if (notFound) return <NotAvailable />;

  if (locked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-0 text-ink-1">
        <div className="w-[360px] rounded-[14px] border border-border-default bg-bg-1 p-7">
          <div className="mb-2.5 text-[30px]">🔑</div>
          <div className="font-display mb-1.5 text-[17px] font-bold">Password protected</div>
          <div className="mb-[18px] text-[12px] text-ink-3">This dashboard requires a password to view.</div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onUnlock()}
            placeholder="Enter password"
            className="mb-2 box-border w-full rounded-lg border border-border-strong bg-bg-0 px-3 py-2.5 text-[13px] text-ink-1 outline-none"
            style={wrongPassword ? { borderColor: "var(--color-brand-red)" } : undefined}
          />
          {wrongPassword && <div className="mb-2.5 text-[11px] text-brand-red">Incorrect password</div>}
          <div
            onClick={onUnlock}
            className="cursor-pointer rounded-lg bg-brand-violet py-2.5 text-center text-[13px] font-semibold text-white"
          >
            Unlock
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return <NotAvailable />;

  const tiles = dashboard.layout.map((tile) => ({
    name: tile.name ?? "Widget",
    type: tile.type ?? "table",
    colSpan: tile.colSpan,
    color: TYPE_COLOR[tile.type ?? "table"] || "#8b5cf6",
  }));

  return (
    <div className="min-h-screen bg-bg-0 text-ink-1">
      <div className="flex items-center justify-between border-b border-border-subtle px-11 py-[18px]">
        <div className="font-display text-[18px] font-bold">{dashboard.name}</div>
        <div className="flex items-center gap-4">
          <select className="rounded-lg border border-border-strong bg-bg-1 px-3 py-[7px] text-[12px] text-ink-1 outline-none">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Year to date</option>
          </select>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
            <div className="h-4 w-4 rounded-[4px]" style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }} />
            Powered by AiDi Studio
          </div>
        </div>
      </div>
      <div className="px-11 py-[26px]">
        {tiles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border-strong p-[60px] text-center text-[13px] text-ink-3">
            This dashboard doesn't have any widgets yet.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4" style={{ gridAutoRows: "170px" }}>
            {tiles.map((tile, i) => (
              <div
                key={i}
                className="flex flex-col rounded-xl border border-border-default bg-bg-1 p-4"
                style={{ gridColumn: `span ${tile.colSpan}` }}
              >
                <div className="mb-2.5 text-[12px] font-semibold text-ink-1">{tile.name}</div>
                <div className="min-h-0 flex-1">
                  <WidgetRenderer type={tile.type} color={tile.color} showLegend showPoints />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
