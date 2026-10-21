import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { GoLink } from "./Button";

const SPAN: Record<number, string> = {
  3: "lg:col-span-3", 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6",
  7: "lg:col-span-7", 8: "lg:col-span-8", 12: "lg:col-span-12",
};

/** 12-column grid on desktop, one column on mobile (blocks stack in source order). */
export function BlockGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">{children}</div>;
}

/**
 * One card on a screen: white, ink outline, hard shadow. `strong` = the main thing on the screen
 * (bigger radius and shadow). `go` adds a link to the related screen under the card header.
 */
export function Block({
  label,
  span = 12,
  strong,
  go,
  bare,
  className,
  children,
}: {
  label?: ReactNode;
  span?: number;
  strong?: boolean;
  go?: { href: string; label: string };
  /** No card chrome: just the grid cell (for toolbars and banners). */
  bare?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3",
        SPAN[span],
        !bare && "border-[1.5px] border-ink bg-white p-5",
        !bare && (strong ? "rounded-[18px] shadow-hard-lg md:p-6" : "rounded-2xl shadow-hard-md"),
        className,
      )}
    >
      {(label || go) && (
        <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          {label && <h2 className="text-xl font-bold">{label}</h2>}
          {go && <GoLink href={go.href}>{go.label}</GoLink>}
        </header>
      )}
      {children}
    </section>
  );
}
