// Session refresh for proxy.ts (Next.js 16's renamed middleware).
// Not wired up yet: the next brief adds proxy.ts with real sign-in, e.g.
//   export async function proxy(request: NextRequest) { return updateSession(request); }

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicEnv } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabasePublicEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Verifies the token and refreshes it if needed. Don't run code between createServerClient and this.
  await supabase.auth.getClaims();
  return response;
}
