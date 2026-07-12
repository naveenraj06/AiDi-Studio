import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ToastKind } from "@/types";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "aidi-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

interface ToastState {
  msg: string;
  kind: ToastKind;
  /** Incremented per toast so a stale auto-dismiss timer can't clear a newer toast. */
  token: number;
}

interface UiState {
  toast: ToastState | null;
  theme: Theme;
}

const initialState: UiState = {
  toast: null,
  theme: getInitialTheme(),
};

let nextToastToken = 0;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setToast(state, action: PayloadAction<{ msg: string; kind: ToastKind }>) {
      state.toast = { ...action.payload, token: ++nextToastToken };
    },
    hideToast(state, action: PayloadAction<number | undefined>) {
      if (action.payload === undefined || state.toast?.token === action.payload) {
        state.toast = null;
      }
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      window.localStorage?.setItem(THEME_STORAGE_KEY, action.payload);
    },
  },
});

export const { setToast, hideToast, setTheme } = uiSlice.actions;
export default uiSlice.reducer;

export const TOAST_DURATION_MS = 2600;

/** Shows a toast and auto-dismisses it after a fixed duration. */
export function showToast(msg: string, kind: ToastKind = "info") {
  return (dispatch: (action: ReturnType<typeof setToast> | ReturnType<typeof hideToast>) => void) => {
    dispatch(setToast({ msg, kind }));
    const token = nextToastToken;
    setTimeout(() => dispatch(hideToast(token)), TOAST_DURATION_MS);
  };
}

export function toggleTheme() {
  return (dispatch: (action: ReturnType<typeof setTheme>) => void, getState: () => { ui: UiState }) => {
    dispatch(setTheme(getState().ui.theme === "dark" ? "light" : "dark"));
  };
}
