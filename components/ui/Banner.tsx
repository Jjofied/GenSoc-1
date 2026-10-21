import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** info = neutral note · success = done · alert = error / needs action · locked = changes closed. */
type Kind = "info" | "success" | "alert" | "locked";

const TONE: Record<Kind, { box: string; glyph: string }> = {
  info: { box: "border-ink bg-white text-ink", glyph: "i" },
  success: { box: "border-ok-dot bg-ok-bg text-ok", glyph: "✓" },
  alert: { box: "border-bad-line bg-bad-bg text-bad", glyph: "!" },
  locked: { box: "border-warn-dot/50 bg-warn-bg text-warn", glyph: "▣" },
};

export function Banner({ kind = "info", children, action }: { kind?: Kind; children: ReactNode; action?: ReactNode }) {
  const t = TONE[kind];
  return (
    <div
      role={kind === "alert" ? "alert" : "status"}
      className={cn("flex flex-wrap items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-[15px]", t.box)}
    >
      <span
        aria-hidden
        className="grid h-6 w-6 flex-none place-items-center rounded-full border-[1.5px] border-current bg-white text-xs font-extrabold"
      >
        {t.glyph}
      </span>
      <span className="min-w-[12rem] flex-1 text-pretty">{children}</span>
      {action}
    </div>
  );
}
