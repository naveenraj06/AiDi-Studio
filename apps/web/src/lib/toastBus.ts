import type { ToastKind } from "@/types";

type ToastFn = (msg: string, kind?: ToastKind) => void;

let impl: ToastFn | null = null;

/** AppProvider registers the real toast() implementation on render so code outside React (e.g. the QueryClient's global error handler) can trigger toasts. */
export function registerToast(fn: ToastFn) {
  impl = fn;
}

export function showToast(msg: string, kind: ToastKind = "error") {
  impl?.(msg, kind);
}
