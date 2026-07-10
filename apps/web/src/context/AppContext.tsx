import * as React from "react";
import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { Session, ToastKind, User } from "@/types";

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function mapSupabaseUser(user: SupabaseUser): User {
  const meta = user.user_metadata as { name?: string; full_name?: string } | undefined;
  const name = meta?.name ?? meta?.full_name ?? user.email?.split("@")[0] ?? "User";
  return {
    id: user.id,
    email: user.email ?? "",
    display_name: name,
    email_verified: user.email_confirmed_at != null,
  };
}

interface ToastState {
  msg: string;
  kind: ToastKind;
}

type FieldErrors = Record<string, string>;
type AuthResult = { ok: boolean; errors?: FieldErrors };
type OAuthProvider = "google" | "github";

interface AppContextValue {
  session: Session | null;
  sessionLoading: boolean;
  isPasswordRecovery: boolean;
  pendingVerificationEmail: string;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<AuthResult>;
  resendVerification: () => Promise<void>;
  sendResetLink: (email: string) => Promise<AuthResult>;
  resetPassword: (password: string, confirmPassword: string) => Promise<AuthResult>;
  logoutAllDevices: () => Promise<void>;
  logout: () => Promise<void>;

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

  const [session, setSession] = React.useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = React.useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = React.useState("");
  const [isPasswordRecovery, setIsPasswordRecovery] = React.useState(false);

  const [toastState, setToastState] = React.useState<ToastState | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = React.useCallback((msg: string, kind: ToastKind = "info") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToastState({ msg, kind });
    timerRef.current = setTimeout(() => setToastState(null), 2600);
  }, []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session?.user ? { user: mapSupabaseUser(data.session.user) } : null);
      setSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      // A password-recovery link creates a real session, but the user must
      // land on /reset-password to set a new password, not get redirected
      // straight to the app by PublicOnly as if they'd logged in normally.
      if (event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
      else if (event === "SIGNED_OUT") setIsPasswordRecovery(false);

      setSession(newSession?.user ? { user: mapSupabaseUser(newSession.user) } : null);
      setSessionLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = React.useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const errors: FieldErrors = {};
      if (!email || !isValidEmail(email)) errors.email = "Enter a valid email address";
      if (!password) errors.password = "Enter your password";
      if (Object.keys(errors).length) return { ok: false, errors };

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = error.message.toLowerCase().includes("confirm")
          ? "Verify your email before signing in"
          : "Invalid email or password";
        return { ok: false, errors: { password: message } };
      }
      toast("Welcome back!", "success");
      navigate("/projects");
      return { ok: true };
    },
    [navigate, toast],
  );

  const loginWithOAuth = React.useCallback(
    async (provider: OAuthProvider) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/projects` },
      });
      if (error) toast(error.message, "error");
    },
    [toast],
  );

  const signup = React.useCallback(
    async (data: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResult> => {
      const errors: FieldErrors = {};
      if (!data.name) errors.name = "Enter your name";
      if (!data.email || !isValidEmail(data.email)) errors.email = "Enter a valid email address";
      if (!data.password || data.password.length < 8) errors.password = "Password must be at least 8 characters";
      if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords don't match";
      if (Object.keys(errors).length) return { ok: false, errors };

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name } },
      });
      if (error) return { ok: false, errors: { email: error.message } };

      if (signUpData.session) {
        toast("Welcome to AiDi Studio!", "success");
        navigate("/projects");
        return { ok: true };
      }

      setPendingVerificationEmail(data.email);
      toast("Account created — check your email", "success");
      navigate("/verify-email");
      return { ok: true };
    },
    [navigate, toast],
  );

  const resendVerification = React.useCallback(async () => {
    if (!pendingVerificationEmail) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: pendingVerificationEmail });
    if (error) toast(error.message, "error");
    else toast("Verification email resent", "info");
  }, [pendingVerificationEmail, toast]);

  const sendResetLink = React.useCallback(
    async (email: string): Promise<AuthResult> => {
      if (!email || !isValidEmail(email)) return { ok: false, errors: { email: "Enter a valid email address" } };
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { ok: false, errors: { email: error.message } };
      toast("Reset link sent — check your email", "success");
      navigate("/login");
      return { ok: true };
    },
    [navigate, toast],
  );

  const resetPassword = React.useCallback(
    async (password: string, confirmPassword: string): Promise<AuthResult> => {
      const errors: FieldErrors = {};
      if (!password || password.length < 8) errors.password = "Password must be at least 8 characters";
      if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
      if (Object.keys(errors).length) return { ok: false, errors };

      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { ok: false, errors: { password: error.message } };
      setIsPasswordRecovery(false);
      toast("Password updated", "success");
      navigate("/projects");
      return { ok: true };
    },
    [navigate, toast],
  );

  const logoutAllDevices = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) toast(error.message, "error");
    else toast("Logged out of all other devices", "success");
  }, [toast]);

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/landing");
  }, [navigate]);

  const value = React.useMemo<AppContextValue>(
    () => ({
      session,
      sessionLoading,
      isPasswordRecovery,
      pendingVerificationEmail,
      login,
      loginWithOAuth,
      signup,
      resendVerification,
      sendResetLink,
      resetPassword,
      logoutAllDevices,
      logout,
      toast,
    }),
    [
      session,
      sessionLoading,
      isPasswordRecovery,
      pendingVerificationEmail,
      login,
      loginWithOAuth,
      signup,
      resendVerification,
      sendResetLink,
      resetPassword,
      logoutAllDevices,
      logout,
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
