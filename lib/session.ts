// Mock session: the signed-in user type lives in a cookie so the server knows it on first render.
// Replace with real auth later. There is no password check.

import { cookies } from "next/headers";
import type { UserType } from "./types";

export const SESSION_COOKIE = "groupme-session";

export function parseSession(value: string | undefined): UserType | null {
  return value === "admin" || value === "student" ? value : null;
}

export async function getSession(): Promise<UserType | null> {
  return parseSession((await cookies()).get(SESSION_COOKIE)?.value);
}
