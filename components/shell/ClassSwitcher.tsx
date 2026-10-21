"use client";

import { AppLink as Link } from "@/lib/app-mode";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { classes } from "@/lib/mock-data";
import { getUser, theClass } from "@/lib/selectors";
import type { User } from "@/lib/types";

/** "CS 3A ▾" menu: current class, other classes (sample only), join/create. */
export function ClassSwitcher({ user, compact }: { user: User; compact?: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute("open");
  const mine = classes.filter((c) => user.classIds.includes(c.id));
  const short = theClass.name.split(" – ")[0];

  return (
    <details ref={ref} className="group relative">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-2 border-[1.5px] border-line font-semibold hover:border-ink [&::-webkit-details-marker]:hidden",
          compact ? "rounded-full px-2.5 py-0.5 text-xs" : "rounded-md px-2.5 py-1.5 text-xs",
        )}
      >
        <span>
          <span className="sr-only">Class: </span>
          {short}
        </span>
        <span aria-hidden>▾</span>
      </summary>
      <div className={cn("absolute z-30 mt-1 w-64 rounded-lg border-2 border-ink bg-white p-1.5 shadow-lg", compact ? "right-0" : "left-0")}>
        <p className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Your classes</p>
        <ul>
          {mine.map((c) => (
            <li key={c.id}>
              {c.id === theClass.id ? (
                <span aria-current="true" className="flex items-center justify-between rounded bg-fill-soft px-2 py-1.5 text-sm font-semibold">
                  {c.name} <span aria-hidden>✓</span>
                </span>
              ) : (
                <span aria-disabled className="flex flex-col rounded px-2 py-1.5 text-sm text-muted">
                  {c.name}
                  <span className="text-[11px]">{getUser(c.adminId)?.name} · sample only, no demo data</span>
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-1 border-t border-line-soft pt-1">
          <Link
            href={user.type === "admin" ? "/admin/classes/new" : "/join"}
            onClick={close}
            className="block rounded px-2 py-1.5 text-sm font-semibold hover:bg-fill-soft"
          >
            {user.type === "admin" ? "＋ Create class" : "＋ Join a class"}
          </Link>
        </div>
      </div>
    </details>
  );
}
