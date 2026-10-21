// Supabase client for Client Components. Uses the publishable key; access is limited by RLS.

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicEnv } from "./env";

export function createClient() {
  const { url, key } = supabasePublicEnv();
  return createBrowserClient(url, key);
}
