"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { mockCurrentUser } from "@/lib/mock-data";
import type { UserType } from "@/lib/types";
import { useViewAs } from "@/lib/view-as";
import { ViewAsSwitcher } from "./ViewAsSwitcher";

const NAV: Record<UserType, { href: string; label: string }[]> = {
  student: [
    { href: "/student", label: "Dashboard" },
    { href: "/groups", label: "Groups" },
    { href: "/calendar", label: "Calendar" },
    { href: "/posts", label: "Posts" },
    { href: "/history", label: "Role history" },
    { href: "/join", label: "Join class" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/groups", label: "Group setup" },
    { href: "/calendar", label: "Calendar" },
    { href: "/posts", label: "Posts" },
    { href: "/history", label: "Role history" },
    { href: "/admin/classes/new", label: "Create class" },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const viewAs = useViewAs();
  const pathname = usePathname();
  const signedOut = pathname === "/";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href={signedOut ? "/" : `/${viewAs}`} className="font-semibold">
            groupme
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {!signedOut && (
              <span className="text-stone-600">
                {mockCurrentUser[viewAs].name} · {viewAs === "admin" ? "Admin" : "Student"}
              </span>
            )}
            <ViewAsSwitcher />
          </div>
        </div>
        {!signedOut && (
          <nav aria-label="Main" className="mx-auto max-w-5xl px-4 pb-2">
            <ul className="flex flex-wrap gap-1 text-sm">
              {NAV[viewAs].map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded px-3 py-1.5 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-stone-900 ${
                        active ? "bg-stone-200 font-medium" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
