// Server-only Supabase client with the SECRET key. It bypasses RLS, so only use it for
// trusted jobs (like the rotation cron), never with input you haven't checked.

import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "./env";

export function createAdminClient() {
  const { url } = supabasePublicEnv();
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set (server only, see .env.example).");
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
