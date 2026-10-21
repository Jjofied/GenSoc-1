// Supabase client for Server Components, Server Functions and Route Handlers.
// Acts as the signed-in user (cookies), so RLS applies. Create one per request.

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublicEnv } from "./env";

export async function createClient() {
  const { url, key } = supabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy (next brief) refreshes the session instead.
        }
      },
    },
  });
}
