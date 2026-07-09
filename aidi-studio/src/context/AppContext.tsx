import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  users,
  initialProjects,
  initialResourcesByProject,
  initialWidgetsByProject,
  initialDashboardsByProject,
  initialTeamByProject,
  initialBillingByProject,
} from "@/data/mockData";
import type {
  ApiResource,
  Billing,
  Dashboard,
  Project,
  Session,
  TeamMember,
  ToastKind,
  Widget,
} from "@/types";

const SESSION_KEY = "aidi_session";

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

interface ToastState {
  msg: string;
  kind: ToastKind;
}

type FieldErrors = Record<string, string>;

interface AppActions {
  setProjects: (fn: (list: Project[]) => Project[]) => void;
  setResources: (pid: string, fn: (list: ApiResource[]) => ApiResource[]) => void;
  setWidgets: (pid: string, fn: (list: Widget[]) => Widget[]) => void;
  setDashboards: (pid: string, fn: (list: Dashboard[]) => Dashboard[]) => void;
  setTeam: (pid: string, fn: (list: TeamMember[]) => TeamMember[]) => void;
  setBilling: (pid: string, fn: (b: Billing) => Billing) => void;
}

interface AppContextValue {
  session: Session | null;
  pendingVerificationEmail: string;
  login: (email: string, password: string) => { ok: boolean; errors?: FieldErrors };
  signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    ok: boolean;
    errors?: FieldErrors;
  };
  verifyEmail: () => void;
  resendVerification: () => void;
  sendResetLink: (email: string) => { ok: boolean; errors?: FieldErrors };
  resetPassword: (password: string, confirmPassword: string) => { ok: boolean; errors?: FieldErrors };
  logoutAllDevices: () => void;
  logout: () => void;

  projects: Project[];
  resourcesByProject: Record<string, ApiResource[]>;
  widgetsByProject: Record<string, Widget[]>;
  dashboardsByProject: Record<string, Dashboard[]>;
  teamByProject: Record<string, TeamMember[]>;
  billingByProject: Record<string, Billing>;
  actions: AppActions;

  toast: (msg: string, kind?: ToastKind) => void;
}

const AppContext = React.createContext<AppContextValue | null>(null);

const TOAST_ICON: Record<ToastKind, string> = { success: "✓", error: "✕", info: "ℹ" };
const TOAST_COLOR: Record<ToastKind, string> = {
  success: "var(--color-brand-green)",
  error: "var(--color-brand-red)",
  info: "var(--color-brand-cyan)",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [session, setSession] = React.useState<Session | null>(loadSession);
  const [pendingVerificationEmail, setPendingVerificationEmail] = React.useState("");

  const [projects, setProjectsState] = React.useState<Project[]>(initialProjects);
  const [resourcesByProject, setResourcesByProject] = React.useState(initialResourcesByProject);
  const [widgetsByProject, setWidgetsByProject] = React.useState(initialWidgetsByProject);
  const [dashboardsByProject, setDashboardsByProject] = React.useState(initialDashboardsByProject);
  const [teamByProject, setTeamByProject] = React.useState(initialTeamByProject);
  const [billingByProject, setBillingByProject] = React.useState(initialBillingByProject);

  const [toastState, setToastState] = React.useState<ToastState | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = React.useCallback((msg: string, kind: ToastKind = "info") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToastState({ msg, kind });
    timerRef.current = setTimeout(() => setToastState(null), 2600);
  }, []);

  const persistSession = React.useCallback((next: Session | null) => {
    try {
      if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* localStorage unavailable — session just won't survive a refresh */
    }
    setSession(next);
  }, []);

  const login = React.useCallback(
    (email: string, password: string) => {
      const errors: FieldErrors = {};
      if (!email || !isValidEmail(email)) errors.email = "Enter a valid email address";
      if (!password || password.length < 6) errors.password = "Password must be at least 6 characters";
      if (Object.keys(errors).length) return { ok: false, errors };
      persistSession({ user: users.u1, mfaVerified: true });
      toast("Welcome back!", "success");
      navigate("/projects");
      return { ok: true };
    },
    [navigate, persistSession, toast],
  );

  const signup = React.useCallback(
    (data: { name: string; email: string; password: string; confirmPassword: string }) => {
      const errors: FieldErrors = {};
      if (!data.name) errors.name = "Enter your name";
      if (!data.email || !isValidEmail(data.email)) errors.email = "Enter a valid email address";
      if (!data.password || data.password.length < 8) errors.password = "Password must be at least 8 characters";
      if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords don't match";
      if (Object.keys(errors).length) return { ok: false, errors };
      setPendingVerificationEmail(data.email);
      toast("Account created — check your email", "success");
      navigate("/verify-email");
      return { ok: true };
    },
    [navigate, toast],
  );

  const verifyEmail = React.useCallback(() => {
    toast("Email verified", "success");
    persistSession({
      user: { ...users.u1, email: pendingVerificationEmail || users.u1.email, email_verified: true },
      mfaVerified: true,
    });
    navigate("/projects");
  }, [navigate, persistSession, pendingVerificationEmail, toast]);

  const resendVerification = React.useCallback(() => {
    toast("Verification email resent", "info");
  }, [toast]);

  const sendResetLink = React.useCallback(
    (email: string) => {
      if (!email || !isValidEmail(email)) return { ok: false, errors: { email: "Enter a valid email address" } };
      toast("Reset link sent — check your email", "success");
      navigate("/reset-password");
      return { ok: true };
    },
    [navigate, toast],
  );

  const resetPassword = React.useCallback(
    (password: string, confirmPassword: string) => {
      const errors: FieldErrors = {};
      if (!password || password.length < 8) errors.password = "Password must be at least 8 characters";
      if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
      if (Object.keys(errors).length) return { ok: false, errors };
      toast("Password updated — sign in", "success");
      navigate("/login");
      return { ok: true };
    },
    [navigate, toast],
  );

  const logoutAllDevices = React.useCallback(() => {
    toast("Logged out of all other devices", "success");
  }, [toast]);

  const logout = React.useCallback(() => {
    persistSession(null);
    navigate("/landing");
  }, [navigate, persistSession]);

  const actions = React.useMemo<AppActions>(
    () => ({
      setProjects: (fn) => setProjectsState((prev) => fn(prev)),
      setResources: (pid, fn) =>
        setResourcesByProject((prev) => ({ ...prev, [pid]: fn(prev[pid] || []) })),
      setWidgets: (pid, fn) => setWidgetsByProject((prev) => ({ ...prev, [pid]: fn(prev[pid] || []) })),
      setDashboards: (pid, fn) =>
        setDashboardsByProject((prev) => ({ ...prev, [pid]: fn(prev[pid] || []) })),
      setTeam: (pid, fn) => setTeamByProject((prev) => ({ ...prev, [pid]: fn(prev[pid] || []) })),
      setBilling: (pid, fn) =>
        setBillingByProject((prev) => ({
          ...prev,
          [pid]: fn(prev[pid] || { plan: "free", status: "active", seats: 1, pricePerSeat: 0, current_period_end: null, card: null, invoices: [] }),
        })),
    }),
    [],
  );

  const value = React.useMemo<AppContextValue>(
    () => ({
      session,
      pendingVerificationEmail,
      login,
      signup,
      verifyEmail,
      resendVerification,
      sendResetLink,
      resetPassword,
      logoutAllDevices,
      logout,
      projects,
      resourcesByProject,
      widgetsByProject,
      dashboardsByProject,
      teamByProject,
      billingByProject,
      actions,
      toast,
    }),
    [
      session,
      pendingVerificationEmail,
      login,
      signup,
      verifyEmail,
      resendVerification,
      sendResetLink,
      resetPassword,
      logoutAllDevices,
      logout,
      projects,
      resourcesByProject,
      widgetsByProject,
      dashboardsByProject,
      teamByProject,
      billingByProject,
      actions,
      toast,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toastState && (
        <div
          className="fixed bottom-[22px] left-1/2 z-[999] flex items-center gap-2 rounded-[10px] border border-border-muted bg-bg-3 px-[18px] py-[11px] text-[13px] text-ink-1 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
          style={{ animation: "aidi-toast-in 0.2s ease" }}
        >
          <span style={{ color: TOAST_COLOR[toastState.kind], fontWeight: 700 }}>
            {TOAST_ICON[toastState.kind]}
          </span>
          {toastState.msg}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
