import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPasswordRecovery, setPendingVerificationEmail } from "@/store/authSlice";
import { showToast } from "@/store/uiSlice";
import type { ToastKind } from "@/types";

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

type FieldErrors = Record<string, string>;
type AuthResult = { ok: boolean; errors?: FieldErrors };
type OAuthProvider = "google" | "github";

/**
 * Preserves the call signature the app previously got from useApp() /
 * AppContext, but backed by authSlice + uiSlice (redux) instead of local
 * React state — session/toast live in the store, this hook just orchestrates
 * validation + Supabase calls + navigation.
 */
export function useAuth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const session = useAppSelector((s) => s.auth.session);
  const sessionLoading = useAppSelector((s) => s.auth.sessionLoading);
  const isPasswordRecovery = useAppSelector((s) => s.auth.isPasswordRecovery);
  const pendingVerificationEmail = useAppSelector((s) => s.auth.pendingVerificationEmail);

  const toast = React.useCallback(
    (msg: string, kind: ToastKind = "info") => {
      dispatch(showToast(msg, kind));
    },
    [dispatch],
  );

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

      dispatch(setPendingVerificationEmail(data.email));
      toast("Account created — check your email", "success");
      navigate("/verify-email");
      return { ok: true };
    },
    [navigate, toast, dispatch],
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
      dispatch(setPasswordRecovery(false));
      toast("Password updated", "success");
      navigate("/projects");
      return { ok: true };
    },
    [navigate, toast, dispatch],
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

  return {
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
  };
}
