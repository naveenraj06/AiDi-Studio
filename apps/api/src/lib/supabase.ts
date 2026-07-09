import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// The secret key bypasses RLS — this API is the trusted backend, so it
// enforces project membership/role checks itself (see authz.ts) rather than
// relying on Postgres RLS policies.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
