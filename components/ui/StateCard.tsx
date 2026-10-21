import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StateKind = "empty" | "error" | "success" | "denied" | "locked" | "info";

const ICON: Record<StateKind, { g: string; shape: string }> = {
  empty: { g: "", shape: "rounded-full border-2 border-dashed border-ink" },
  error: { g: "!", shape: "rounded-lg border-[3px] border-ink" },
  success: { g: "✓", shape: "rounded-full border-2 border-ink" },
  denied: { g: "⊘", shape: "rounded-lg border-2 border-ink" },
  locked: { g: "▣", shape: "rounded-lg border-2 border-ink" },
  info: { g: "i", shape: "rounded-full border-2 border-ink" },
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
  const { g, shape } = ICON[kind];
  return (
    <div
      role={kind === "error" || kind === "denied" ? "alert" : undefined}
      className="flex flex-col items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-ink bg-white px-6 py-10 text-center"
    >
      <span aria-hidden className={cn("grid h-12 w-12 place-items-center text-xl font-bold", shape)}>
        {g}
      </span>
      <h2 className="text-balance text-lg font-bold">{title}</h2>
      {children && <div className="max-w-prose text-pretty text-sm text-ink-2">{children}</div>}
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
