interface TextWidgetProps {
  title?: string;
  body?: string;
  align?: "left" | "center" | "right";
}

export function TextWidget({ title, body, align = "left" }: TextWidgetProps) {
  return (
    <div className="flex h-full flex-col gap-1.5 overflow-y-auto" style={{ textAlign: align }}>
      {title && <div className="text-[13px] font-semibold text-ink-1">{title}</div>}
      <div className="whitespace-pre-wrap text-[12px] leading-[1.6] text-ink-2">
        {body || "Add text in the builder…"}
      </div>
    </div>
  );
}
