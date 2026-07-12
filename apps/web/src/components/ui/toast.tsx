import { useAppSelector } from "@/store/hooks";
import type { ToastKind } from "@/types";

const TOAST_ICON: Record<ToastKind, string> = { success: "✓", error: "✕", info: "ℹ" };
const TOAST_COLOR: Record<ToastKind, string> = {
  success: "var(--color-brand-green)",
  error: "var(--color-brand-red)",
  info: "var(--color-brand-cyan)",
};

/** Renders the current global toast (see uiSlice's showToast). Mount once near the app root. */
export function ToastViewport() {
  const toast = useAppSelector((s) => s.ui.toast);
  if (!toast) return null;

  return (
    <div
      className="fixed bottom-[22px] left-1/2 z-[999] flex items-center gap-2 rounded-lg border border-border-muted bg-bg-3 px-[18px] py-[11px] text-[13px] text-ink-1 shadow-lg"
      style={{ animation: "aidi-toast-in var(--duration-base) var(--ease-out)" }}
    >
      <span style={{ color: TOAST_COLOR[toast.kind], fontWeight: 700 }}>{TOAST_ICON[toast.kind]}</span>
      {toast.msg}
    </div>
  );
}
