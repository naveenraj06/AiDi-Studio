import * as React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { TYPE_COLOR } from "@/components/widgets/widgetTypeMeta";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

export default function PublicDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { dashboardsByProject, widgetsByProject, toast } = useApp();

  const [unlocked, setUnlocked] = React.useState(false);
  const [pw, setPw] = React.useState("");

  const match = React.useMemo(() => {
    for (const pid in dashboardsByProject) {
      const found = dashboardsByProject[pid].find((d) => d.slug === slug);
      if (found) return { dashboard: found, projectId: pid };
    }
    return null;
  }, [dashboardsByProject, slug]);

  if (!match || match.dashboard.status !== "published") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2.5 bg-bg-0 text-ink-1">
        <div className="text-[34px]">🔒</div>
        <div className="font-display text-[18px] font-bold">This dashboard isn't available</div>
        <div className="text-[13px] text-ink-3">It may be unpublished, or the link is incorrect.</div>
      </div>
    );
  }

  const { dashboard, projectId } = match;
  const isUnlockRoute = location.pathname.endsWith("/unlock");
  const passwordProtected = !!dashboard.share_password_hash || isUnlockRoute;
  const needsUnlock = passwordProtected && !unlocked;

  const onUnlock = () => {
    if (!pw) {
      toast("Enter the password", "error");
      return;
    }
    setUnlocked(true);
    toast("Unlocked", "success");
  };

  if (needsUnlock) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-0 text-ink-1">
        <div className="w-[360px] rounded-[14px] border border-border-default bg-bg-1 p-7">
          <div className="mb-2.5 text-[30px]">🔑</div>
          <div className="font-display mb-1.5 text-[17px] font-bold">Password protected</div>
          <div className="mb-[18px] text-[12px] text-ink-3">{dashboard.name} requires a password to view.</div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter password"
            className="mb-3.5 box-border w-full rounded-lg border border-border-strong bg-bg-0 px-3 py-2.5 text-[13px] text-ink-1 outline-none"
          />
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

  const widgets = widgetsByProject[projectId] || [];
  const widgetMap = new Map(widgets.map((w) => [w.id, w]));
  const tiles = dashboard.widgetIds.map((id) => {
    const w = widgetMap.get(id) || { name: "Widget", type: "table" as const };
    return { name: w.name, type: w.type, color: TYPE_COLOR[w.type] || "#8b5cf6" };
  });

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
        <div className="grid grid-cols-4 gap-4" style={{ gridAutoRows: "170px" }}>
          {tiles.map((tile, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border border-border-default bg-bg-1 p-4"
              style={{ gridColumn: "span 2" }}
            >
              <div className="mb-2.5 text-[12px] font-semibold text-ink-1">{tile.name}</div>
              <div className="min-h-0 flex-1">
                <WidgetRenderer type={tile.type} color={tile.color} showLegend showPoints />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
