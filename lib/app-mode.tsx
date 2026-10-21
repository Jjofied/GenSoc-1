"use client";

// Which copy of the app is running:
// - live: the main routes. Today they still use the in-memory store and a mock session cookie;
//   the next brief swaps that provider for Supabase without touching the screens.
// - demo: /demo/*, dummy data only, no sign-in or keys needed, prototype tools always on.

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";

export interface AppMode {
  kind: "live" | "demo";
  /** Prefix for every in-app link. */
  base: "" | "/demo";
  /** Cookie that remembers the mock "View as" choice. */
  sessionCookie: string;
  /** "View as" switch + Prototype preview strip. */
  devTools: boolean;
}

export const LIVE_MODE: AppMode = {
  kind: "live",
  base: "",
  sessionCookie: "groupme-session",
  devTools: process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === "true",
};

export const DEMO_MODE: AppMode = { kind: "demo", base: "/demo", sessionCookie: "groupme-demo-view", devTools: true };

const ModeContext = createContext<AppMode>(LIVE_MODE);

export function ModeProvider({ mode, children }: { mode: "live" | "demo"; children: ReactNode }) {
  return <ModeContext value={mode === "demo" ? DEMO_MODE : LIVE_MODE}>{children}</ModeContext>;
}

export const useMode = () => useContext(ModeContext);

/** Turns an app path ("/groups") into the right URL for this mode ("/demo/groups"). */
export function useHref() {
  const { base } = useMode();
  return (path: string) => (path.startsWith("/") ? (path === "/" ? base || "/" : `${base}${path}`) : path);
}

/** The current path without the mode prefix, for nav highlighting. */
export function appPath(pathname: string, base: string) {
  return base && pathname.startsWith(base) ? pathname.slice(base.length) || "/" : pathname;
}

/** next/link that adds the mode prefix to app paths. */
export function AppLink({ href, ...props }: Omit<ComponentProps<typeof NextLink>, "href"> & { href: string }) {
  return <NextLink href={useHref()(href)} {...props} />;
}

export function useAppRouter() {
  const router = useRouter();
  const href = useHref();
  return { push: (path: string) => router.push(href(path)) };
}
