"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Bits";
import { cn } from "@/lib/cn";
import { showDevTools, useDemo } from "@/lib/demo-store";
import { ME_ID, TEACHER_ID } from "@/lib/mock-data";
import { getUser } from "@/lib/selectors";
import type { UserType } from "@/lib/types";
import { ClassSwitcher } from "./ClassSwitcher";
import { Logo } from "./Logo";
import { NAV, NO_NAV, ROLE_LABEL } from "./nav";

const isActive = (pathname: string, href: string) =>
  pathname === href || (href === "/groups" && pathname === "/groups/role");

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, signOut, signIn } = useDemo();
  const viewAs = state.viewAs;
  const user = viewAs ? getUser(viewAs === "admin" ? TEACHER_ID : ME_ID) : undefined;
  const withNav = !!viewAs && !!user && !NO_NAV.includes(pathname);
  const home = viewAs ? `/${viewAs === "admin" ? "admin" : "student"}` : "/";

  const doSignOut = () => {
    signOut();
    router.push("/?signedout=1");
  };

  const switchView = (type: UserType) => {
    signIn(type);
    if (pathname === "/student" || pathname === "/admin") router.push(`/${type}`);
  };

  return (
    <div className="min-h-screen md:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>

      {withNav && (
        <aside className="sticky top-0 hidden h-screen w-52 flex-none flex-col gap-3 border-r-[1.5px] border-line-soft bg-white px-3 py-4 md:flex">
          <Logo href={home} />
          <ClassSwitcher user={user} />
          <nav aria-label="Main">
            <ul className="flex flex-col gap-0.5">
              {NAV[viewAs].map((item) => {
                const on = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={on ? "page" : undefined}
                      className={cn("block rounded-md px-2.5 py-1.5 text-sm", on ? "bg-ink font-bold text-white" : "font-medium hover:bg-fill-soft")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-2 text-xs">
            <span className="flex items-center gap-2 font-semibold">
              <Avatar name={user.name} size="sm" />
              <span className="flex flex-col">
                {user.name}
                <span className="font-normal text-muted">{ROLE_LABEL[viewAs]}</span>
              </span>
            </span>
            <button type="button" onClick={doSignOut} className="rounded-md border-[1.2px] border-line py-1.5 font-semibold hover:border-ink">
              Sign out
            </button>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar, and the plain top bar for screens without nav. */}
        <div className={cn("sticky top-0 z-20 flex h-12 items-center gap-2 border-b-[1.5px] border-line-soft bg-white px-4", withNav && "md:hidden")}>
          <Logo href={home} />
          {withNav && (
            <div className="ml-auto flex items-center gap-2">
              <ClassSwitcher user={user} compact />
              <details className="relative">
                <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden" aria-label="Account menu">
                  <Avatar name={user.name} size="sm" />
                </summary>
                <div className="absolute right-0 z-30 mt-1 flex w-48 flex-col rounded-lg border-2 border-ink bg-white p-1.5 text-sm shadow-lg">
                  <span className="px-2 py-1 font-semibold">
                    {user.name} · {ROLE_LABEL[viewAs]}
                  </span>
                  {viewAs === "admin" && (
                    <Link href="/admin/groups" className="rounded px-2 py-1.5 hover:bg-fill-soft">
                      Settings
                    </Link>
                  )}
                  <button type="button" onClick={doSignOut} className="rounded px-2 py-1.5 text-left hover:bg-fill-soft">
                    Sign out
                  </button>
                </div>
              </details>
            </div>
          )}
          {viewAs && !withNav && pathname !== "/" && (
            <Link href={home} className="ml-auto text-sm font-semibold text-accent hover:text-accent-strong">
              Back to class
            </Link>
          )}
        </div>

        {showDevTools && viewAs && pathname !== "/" && (
          <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-line bg-fill-soft px-4 py-1.5 text-xs md:px-6">
            <span className="font-mono font-bold uppercase tracking-wider text-muted">Dev</span>
            <span className="text-muted">View as:</span>
            {(["student", "admin"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={viewAs === t}
                onClick={() => switchView(t)}
                className={cn("rounded-full border-[1.2px] px-2.5 py-0.5 font-semibold", viewAs === t ? "border-ink bg-ink text-white" : "border-line bg-white")}
              >
                {ROLE_LABEL[t]}
              </button>
            ))}
            <span className="text-muted">· Demo changes reset on reload</span>
          </div>
        )}

        <main id="main" className={cn("mx-auto w-full max-w-6xl flex-1 px-4 py-5 md:px-6 md:py-6", withNav && "pb-24 md:pb-8")}>
          {children}
        </main>
      </div>

      {withNav && (
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 grid h-14 grid-cols-5 border-t-[1.5px] border-line-soft bg-white md:hidden">
          {NAV[viewAs].filter((i) => i.tab).map((item) => {
            const on = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn("flex flex-col items-center justify-center gap-1 border-t-[3px] text-[11px]", on ? "border-ink font-bold" : "border-transparent font-medium")}
              >
                <span aria-hidden className={cn("h-3.5 w-3.5 rounded-[3px] border-[1.2px] border-ink", on ? "bg-ink" : "bg-white")} />
                {item.tab}
              </Link>
            );
          })}
        </nav>
      )}

      <Toast />
    </div>
  );
}

function Toast() {
  const { state, toast } = useDemo();
  const current = state.toast;

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => toast(null), 4000);
    return () => clearTimeout(timer);
  }, [current, toast]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-16 z-40 flex justify-center px-4 md:bottom-6">
      {current && (
        <div key={current.id} className="pointer-events-auto flex items-center gap-3 rounded-lg border-2 border-ink bg-white px-4 py-2.5 text-sm font-semibold shadow-lg">
          <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full border-2 border-ink text-[10px]">✓</span>
          {current.text}
          <button type="button" onClick={() => toast(null)} aria-label="Dismiss" className="ml-1 text-muted hover:text-ink">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
