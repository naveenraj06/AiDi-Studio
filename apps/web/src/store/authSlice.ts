import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@/types";

interface AuthState {
  session: Session | null;
  sessionLoading: boolean;
  isPasswordRecovery: boolean;
  pendingVerificationEmail: string;
}

const initialState: AuthState = {
  session: null,
  sessionLoading: true,
  isPasswordRecovery: false,
  pendingVerificationEmail: "",
};

function mapSupabaseUser(user: SupabaseUser): Session["user"] {
  const meta = user.user_metadata as { name?: string; full_name?: string } | undefined;
  const name = meta?.name ?? meta?.full_name ?? user.email?.split("@")[0] ?? "User";
  return {
    id: user.id,
    email: user.email ?? "",
    display_name: name,
    email_verified: user.email_confirmed_at != null,
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
      state.sessionLoading = false;
    },
    setPasswordRecovery(state, action: PayloadAction<boolean>) {
      state.isPasswordRecovery = action.payload;
    },
    setPendingVerificationEmail(state, action: PayloadAction<string>) {
      state.pendingVerificationEmail = action.payload;
    },
  },
});

export const { setSession, setPasswordRecovery, setPendingVerificationEmail } = authSlice.actions;
export default authSlice.reducer;

/** Wires the Supabase auth listener to the store. Call once at app startup (see store/index.ts). */
export function initAuthListener(dispatch: (action: unknown) => void) {
  supabase.auth.getSession().then(({ data }) => {
    dispatch(setSession(data.session?.user ? { user: mapSupabaseUser(data.session.user) } : null));
  });

  const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
    // A password-recovery link creates a real session, but the user must
    // land on /reset-password to set a new password, not get redirected
    // straight to the app by PublicOnly as if they'd logged in normally.
    if (event === "PASSWORD_RECOVERY") dispatch(setPasswordRecovery(true));
    else if (event === "SIGNED_OUT") dispatch(setPasswordRecovery(false));

    dispatch(setSession(newSession?.user ? { user: mapSupabaseUser(newSession.user) } : null));
  });

  return () => listener.subscription.unsubscribe();
}
