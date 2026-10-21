import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StateKind = "empty" | "error" | "success" | "denied" | "locked" | "info";

const ICON: Record<StateKind, { g: string; tone: string }> = {
  empty: { g: "", tone: "border-2 border-dashed border-muted-line bg-white" },
  error: { g: "!", tone: "border-[1.5px] border-ink bg-bad-bg text-bad" },
  success: { g: "✓", tone: "border-[1.5px] border-ink bg-ok-bg text-ok" },
  denied: { g: "⊘", tone: "border-[1.5px] border-ink bg-bad-bg text-bad" },
  locked: { g: "▣", tone: "border-[1.5px] border-ink bg-warn-bg text-warn" },
  info: { g: "i", tone: "border-[1.5px] border-ink bg-lavender text-primary" },
};

/** Full-card empty / error / success / permission-denied / locked message. */
export function StateCard({
  kind,
  title,
  children,
  action,
}: {
  kind: StateKind;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const { g, tone } = ICON[kind];
  return (
    <div
      role={kind === "error" || kind === "denied" ? "alert" : undefined}
      className={cn(
        "flex flex-col items-start gap-3.5 rounded-2xl bg-white px-6 py-7",
        kind === "empty" ? "border-[1.5px] border-dashed border-muted-line" : "border-[1.5px] border-ink shadow-hard-md",
      )}
    >
      <span aria-hidden className={cn("grid h-12 w-12 place-items-center rounded-full text-xl font-extrabold", tone)}>
        {g}
      </span>
      <h2 className="text-balance text-2xl font-bold">{title}</h2>
      {children && <div className="max-w-prose text-pretty text-ink-2">{children}</div>}
      {action && <div className="mt-1 flex flex-wrap gap-2.5">{action}</div>}
    </div>
  );
}
