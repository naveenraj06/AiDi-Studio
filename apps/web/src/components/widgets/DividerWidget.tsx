interface DividerWidgetProps {
  title?: string;
  dashed?: boolean;
}

export function DividerWidget({ title, dashed = false }: DividerWidgetProps) {
  return (
    <div className="flex h-full items-center gap-3">
      {title && (
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-3">{title}</span>
      )}
      {dashed ? (
        <div className="flex-1 border-t border-dashed border-border-default" />
      ) : (
        <div className="h-px flex-1 bg-border-default" />
      )}
    </div>
  );
}
