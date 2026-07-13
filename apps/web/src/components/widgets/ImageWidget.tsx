interface ImageWidgetProps {
  imageUrl?: string;
  title?: string;
}

export function ImageWidget({ imageUrl, title }: ImageWidgetProps) {
  if (!imageUrl) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border-strong text-[11px] text-ink-3">
        Add an image URL in the builder
      </div>
    );
  }
  return <img src={imageUrl} alt={title ?? "Widget image"} className="h-full w-full rounded-lg object-cover" />;
}
