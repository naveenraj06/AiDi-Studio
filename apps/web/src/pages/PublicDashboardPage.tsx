import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetPublicDashboardQuery } from "@/store/api/publicDashboardApi";
import type { AxiosBaseQueryError } from "@/store/axiosBaseQuery";
import { deriveLiveSource } from "@/lib/liveData";
import { TYPE_COLOR, TYPE_ICON } from "@/components/widgets/widgetTypeMeta";
import { WidgetCardHeader } from "@/components/widgets/WidgetCardHeader";
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
  // Lets an embedding page (e.g. the @aidistudio/embed SDK's `password` prop) pass the
  // share password straight through the iframe URL instead of showing the unlock form.
  const [searchParams] = useSearchParams();

  const [pw, setPw] = React.useState("");
  const [submittedPassword, setSubmittedPassword] = React.useState<string | undefined>(searchParams.get("password") ?? undefined);
  const [wrongPassword, setWrongPassword] = React.useState(false);

  const { data: dashboard, isLoading, error } = useGetPublicDashboardQuery(
    { slug: slug ?? "", password: submittedPassword },
    { skip: !slug },
  );
  const queryError = error as AxiosBaseQueryError | undefined;

  const locked = queryError?.status === 401;
  const notFound = !!queryError && queryError.status !== 401;

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
        <div className="w-[360px] rounded-xl border border-border-default bg-bg-1 p-7">
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
    liveSource: deriveLiveSource(tile.resource, tile.type ?? "table"),
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
            <div className="h-4 w-4 rounded-xs" style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }} />
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
                <WidgetCardHeader icon={TYPE_ICON[tile.type]} color={tile.color} title={tile.name} />
                <div className="min-h-0 flex-1">
                  {/* Anonymous viewers never receive resource_id/mapping (see
                      serializeDashboard's PUBLIC_DASHBOARD_SELECT), so public
                      dashboards render sample data except for the weather/news
                      demo, which fetches straight from public APIs. */}
                  <WidgetRenderer type={tile.type} ft={{ color: tile.color }} liveSource={tile.liveSource} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
