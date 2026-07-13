interface ButtonWidgetProps {
  buttonLabel?: string;
  buttonUrl?: string;
  color?: string;
}

// Widget config is authored by a project editor but rendered for anyone
// viewing a published dashboard, so only ever emit an href for http(s) URLs —
// a javascript: URL here would execute in the *viewer's* browser on click.
function safeHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

export function ButtonWidget({ buttonLabel = "Open link", buttonUrl, color = "#8b5cf6" }: ButtonWidgetProps) {
  const href = safeHref(buttonUrl);
  return (
    <div className="flex h-full items-center justify-center">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={href ? "cursor-pointer" : "pointer-events-none opacity-60"}
      >
        <span
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white"
          style={{ background: color }}
        >
          {buttonLabel}
        </span>
      </a>
    </div>
  );
}
