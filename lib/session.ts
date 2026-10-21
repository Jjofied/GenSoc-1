// Mock session: the "View as" user type lives in a cookie so the server knows it on first render.
// Main routes and /demo use separate cookies. Real Supabase sign-in replaces the live one next.

import { cookies } from "next/headers";
import type { UserType } from "./types";

export const LIVE_SESSION_COOKIE = "groupme-session";
export const DEMO_SESSION_COOKIE = "groupme-demo-view";

export function parseSession(value: string | undefined): UserType | null {
  return value === "admin" || value === "student" ? value : null;
}

export async function readSessionCookie(name: string): Promise<UserType | null> {
  return parseSession((await cookies()).get(name)?.value);
}
