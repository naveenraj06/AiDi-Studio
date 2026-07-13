import * as React from "react";

interface WidgetCardHeaderProps {
  icon: string;
  color: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/** Icon badge + title + optional subtitle, with an optional slot for right-aligned
 * controls (filter, settings, resize, remove, …) — the one card header every widget
 * type uses above its body, wherever a widget is displayed: the dashboard builder,
 * published dashboards, and the component gallery/landing page previews. */
export function WidgetCardHeader({ icon, color, title, subtitle, actions }: WidgetCardHeaderProps) {
  return (
    <div className="mb-2.5 flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px]"
          style={{ background: `${color}22`, color }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-ink-1">
            {title}
          </div>
          {subtitle && (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-ink-3">{subtitle}</div>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}
