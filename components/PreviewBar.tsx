"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useMode } from "@/lib/app-mode";

export interface PreviewGroup {
  /** URL search param this group controls, e.g. "v" or "state". */
  param: string;
  label: string;
  /** [value, label]. Value "" = the param is removed (live screen). */
  options: [string, string][];
}

/**
 * Prototype-only strip for the canvas's layout options and states that the demo data
 * can't reach on its own. Hidden unless dev tools are on.
 */
export function PreviewBar({ groups, current }: { groups: PreviewGroup[]; current: Record<string, string> }) {
  const pathname = usePathname();
  if (!useMode().devTools) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border-[1.5px] border-dashed border-line bg-white px-3 py-2">
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Prototype preview</span>
      {groups.map((g) => (
        <div key={g.param} role="group" aria-label={g.label} className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">{g.label}:</span>
          {g.options.map(([value, text]) => {
            const query = { ...current, [g.param]: value };
            const clean = Object.fromEntries(Object.entries(query).filter(([, v]) => v));
            const on = (current[g.param] ?? "") === value;
            return (
              <Link
                key={value || "live"}
                href={{ pathname, query: clean }}
                aria-current={on ? "true" : undefined}
                scroll={false}
                className={cn(
                  "rounded-full border-[1.2px] px-2.5 py-0.5 text-xs font-semibold",
                  on ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                )}
              >
                {text}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

