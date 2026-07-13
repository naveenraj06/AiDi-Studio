interface ContainerWidgetProps {
  title?: string;
  description?: string;
  color?: string;
}

export function ContainerWidget({ title, description, color = "#8b5cf6" }: ContainerWidgetProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-1 border-l-4 pl-3" style={{ borderColor: color }}>
      <div className="text-[15px] font-bold text-ink-1">{title || "Section title"}</div>
      {description && <div className="text-[12px] text-ink-3">{description}</div>}
    </div>
  );
}
