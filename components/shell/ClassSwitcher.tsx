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
          "flex cursor-pointer list-none items-center justify-between gap-2 border-[1.5px] border-ink bg-mint text-ink [&::-webkit-details-marker]:hidden",
          compact ? "h-10 rounded-full px-3 text-sm font-bold" : "rounded-[10px] px-3 py-2.5 text-left",
        )}
      >
        {compact ? (
          <span>
            <span className="sr-only">Switch class, current </span>
            {short}
          </span>
        ) : (
          <span className="flex min-w-0 flex-col">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-muted">Class</span>
            <span className="text-[15px] font-bold leading-tight">{theClass.name}</span>
          </span>
        )}
        <span aria-hidden>▾</span>
      </summary>
      <div className={cn("absolute z-30 mt-1.5 w-[270px] rounded-xl border-[1.5px] border-ink bg-white p-1.5 shadow-hard-md", compact ? "right-0" : "left-0")}>
        <p className="px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] text-muted">Your classes</p>
        <ul>
          {mine.map((c) => (
            <li key={c.id}>
              {c.id === theClass.id ? (
                <span aria-current="true" className="flex min-h-11 items-center justify-between gap-2 rounded-lg px-2.5 text-[15px]">
                  {c.name} <b aria-hidden>✓</b>
                </span>
              ) : (
                <span aria-disabled className="flex min-h-11 flex-col justify-center rounded-lg px-2.5 py-1.5 text-[15px] text-muted">
                  {c.name}
                  <span className="text-xs">{getUser(c.adminId)?.name} · sample only, no demo data</span>
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-1 border-t border-mint-line pt-1">
          <Link
            href={user.type === "admin" ? "/admin/classes/new" : "/join"}
            onClick={close}
            className="flex min-h-11 items-center rounded-lg px-2.5 text-[15px] font-bold hover:bg-mint-hover"
          >
            {user.type === "admin" ? "＋ Create a class" : "＋ Join another class"}
          </Link>
        </div>
      </div>
    </details>
  );
}
