"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Bits";
import { AppLink as Link, appPath, useAppRouter, useMode } from "@/lib/app-mode";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { ME_ID, TEACHER_ID } from "@/lib/mock-data";
import { getUser } from "@/lib/selectors";
import type { UserType } from "@/lib/types";
import { ClassSwitcher } from "./ClassSwitcher";
import { Logo } from "./Logo";
import { NAV, NO_NAV, ROLE_LABEL } from "./nav";

const isActive = (pathname: string, href: string) =>
  pathname === href || (href === "/groups" && pathname === "/groups/role");

export function AppShell({ children }: { children: ReactNode }) {
  const mode = useMode();
  const pathname = appPath(usePathname(), mode.base);
  const router = useAppRouter();
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
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:border-[1.5px] focus:border-ink focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>

      {withNav && (
        <aside className="sticky top-0 z-30 hidden h-screen w-60 flex-none flex-col gap-[18px] border-r-[1.5px] border-ink bg-white px-3.5 pb-4 pt-5 md:flex">
          <div className="px-2">
            <Logo href={home} size="lg" />
          </div>
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
                      className={cn("flex h-11 items-center gap-3 rounded-[10px] px-3", on ? "bg-lavender font-bold" : "hover:bg-mint-hover")}
                    >
                      <span aria-hidden className="w-[22px] text-center text-[17px]">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-2.5 border-t-[1.5px] border-ink px-2 pt-3.5">
            <span className="flex items-center gap-2.5 leading-tight">
              <Avatar name={user.name} size="lg" />
              <span className="flex flex-col">
                <b>{user.name}</b>
                <span className="text-sm text-muted">{ROLE_LABEL[viewAs]}</span>
              </span>
            </span>
            <button type="button" onClick={doSignOut} className="h-10 rounded-[10px] border-[1.5px] border-ink bg-white text-[15px] font-bold hover:bg-mint-hover">
              Sign out
            </button>
            <span className="text-[13px] text-muted">Using a shared computer? Always sign out when you’re done.</span>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar, and the plain top bar for screens without nav. Sign-in draws its own header. */}
        {pathname !== "/" && (
          <div className={cn("sticky top-0 z-20 flex h-14 items-center gap-2.5 border-b-[1.5px] border-ink bg-white px-3 md:px-6", withNav && "md:hidden")}>
            <Logo href={home} />
            {withNav && (
              <div className="ml-auto flex items-center gap-2">
                <ClassSwitcher user={user} compact />
                <details className="relative">
                  <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden" aria-label="Account menu">
                    <Avatar name={user.name} size="lg" />
                  </summary>
                  <div className="absolute right-0 z-30 mt-1.5 flex w-60 flex-col rounded-xl border-[1.5px] border-ink bg-white p-1.5 text-[15px] shadow-hard-md">
                    <span className="px-2.5 py-1.5 font-bold">
                      {user.name} · {ROLE_LABEL[viewAs]}
                    </span>
                    {viewAs === "admin" && (
                      <Link href="/admin/groups" className="flex min-h-11 items-center rounded-lg px-2.5 hover:bg-mint-hover">
                        Settings (group setup)
                      </Link>
                    )}
                    <button type="button" onClick={doSignOut} className="flex min-h-11 items-center rounded-lg px-2.5 text-left hover:bg-mint-hover">
                      Sign out
                    </button>
                  </div>
                </details>
              </div>
            )}
            {viewAs && !withNav && pathname !== "/" && (
              <Link href={home} className="ml-auto text-[15px] font-bold underline underline-offset-4 hover:text-muted">
                Back to class
              </Link>
            )}
          </div>
        )}

        {mode.kind === "demo" && (
          <div role="note" className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b-[1.5px] border-ink bg-ink px-4 py-1.5 text-[13px] text-white md:px-10">
            <b className="font-mono uppercase tracking-wider">Demo — dummy data</b>
            <span>No real accounts. Changes reset on reload.</span>
          </div>
        )}

        {mode.devTools && viewAs && pathname !== "/" && (
          <div className="flex flex-wrap items-center gap-2 border-b-[1.5px] border-dashed border-muted-line bg-white/60 px-4 py-1.5 text-[13px] md:px-10">
            <span className="font-mono font-bold uppercase tracking-wider text-muted">Dev</span>
            <span className="text-muted">View as:</span>
            {(["student", "admin"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={viewAs === t}
                onClick={() => switchView(t)}
                className={cn("rounded-full border-[1.5px] px-2.5 py-0.5 font-bold", viewAs === t ? "border-ink bg-ink text-white" : "border-dashed border-muted-line bg-white")}
              >
                {ROLE_LABEL[t]}
              </button>
            ))}
            {mode.kind === "live" && <span className="text-muted">· Demo changes reset on reload</span>}
          </div>
        )}

        <main id="main" className={cn("mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-5 md:px-10 md:pb-12 md:pt-8", withNav && "pb-24 md:pb-12")}>
          {children}
        </main>
      </div>

      {withNav && (
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-5 border-t-[1.5px] border-ink bg-white md:hidden">
          {NAV[viewAs].filter((i) => i.tab).map((item) => {
            const on = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn("flex flex-col items-center justify-center gap-0.5 border-t-[3px] text-xs", on ? "border-ink font-bold text-ink" : "border-transparent text-muted")}
              >
                <span aria-hidden className="text-[19px] leading-none">
                  {item.icon}
                </span>
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
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[84px] z-40 flex justify-center px-4 md:bottom-6">
      {current && (
        <div key={current.id} className="pointer-events-auto flex items-center gap-3 rounded-full border-[1.5px] border-ink bg-ink px-5 py-3 text-[15px] font-bold text-white shadow-hard-sm">
          <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] text-ink">✓</span>
          {current.text}
          <button type="button" onClick={() => toast(null)} aria-label="Dismiss" className="ml-1 grid h-7 w-7 place-items-center rounded-full text-white/70 hover:text-white">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
