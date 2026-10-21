import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** info = neutral note · alert = needs action (▲) · locked = changes closed (▣). */
export function Banner({
  kind = "info",
  children,
  action,
}: {
  kind?: "info" | "alert" | "locked";
  children: ReactNode;
  action?: ReactNode;
}) {
  const glyph = { info: "i", alert: "▲", locked: "▣" }[kind];
  return (
    <div
      role={kind === "alert" ? "alert" : "status"}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-md px-3.5 py-2.5 text-sm",
        kind === "info" ? "border-[1.5px] border-line bg-white" : "border-2 border-ink bg-fill-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid h-6 w-6 flex-none place-items-center font-mono text-xs font-bold",
          kind === "info" ? "rounded-full border-[1.5px] border-ink" : "rounded bg-ink text-white",
        )}
      >
        {glyph}
      </span>
      <span className="min-w-0 flex-1 text-pretty">{children}</span>
      {action}
    </div>
  );
}
