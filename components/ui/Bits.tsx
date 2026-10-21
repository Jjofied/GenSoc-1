import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Labelled progress bar, e.g. "Roles done 2/6". */
export function ProgressBar({ label, value, note }: { label: ReactNode; value: number; note?: ReactNode }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between gap-2 text-xs">
        <span className="font-medium">{label}</span>
        {note !== undefined && <span className="font-mono font-semibold">{note}</span>}
      </div>
      <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={typeof label === "string" ? label : undefined} className="h-2.5 overflow-hidden rounded-full border-[1.5px] border-ink bg-white">
        <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export interface TimelineItem {
  title: ReactNode;
  sub?: ReactNode;
  done?: boolean;
  current?: boolean;
}

/** Vertical steps. Solid dot = done or happening now, hollow = later. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
          {i < items.length - 1 && <span aria-hidden className="absolute left-[7px] top-4 h-full w-px bg-line" />}
          <span
            aria-hidden
            className={cn(
              "relative mt-0.5 h-4 w-4 flex-none rounded-full border-2 border-ink",
              item.done || item.current ? "bg-ink" : "bg-white",
              item.current && "outline-2 outline-offset-2 outline-ink",
            )}
          />
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold">{item.title}</span>
            {item.sub && <span className="text-xs text-muted">{item.sub}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function KeyValue({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      {items.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="text-right font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Small uppercase mono label, used above sections and on post types. */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[11px] font-bold uppercase tracking-wider text-muted", className)}>{children}</span>;
}

/** Gray box standing in for an image or QR code. */
export function ImagePlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("grid place-items-center border-[1.5px] border-line font-mono text-[11px] text-muted", className)}
      style={{
        background:
          "linear-gradient(to top right,transparent calc(50% - 1px),#c2c2c2 50%,transparent calc(50% + 1px))," +
          "linear-gradient(to top left,transparent calc(50% - 1px),#c2c2c2 50%,transparent calc(50% + 1px))",
      }}
    >
      <span className="bg-white px-1.5">{label}</span>
    </div>
  );
}

export function Avatar({ name, size = "md", you }: { name: string; size?: "sm" | "md"; you?: boolean }) {
  const initials = name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2);
  return (
    <span
      aria-hidden
      className={cn(
        "grid flex-none place-items-center rounded-full border-[1.2px] font-mono font-bold",
        size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-[11px]",
        you ? "border-ink bg-ink text-white" : "border-line bg-fill text-ink",
      )}
    >
      {initials}
    </span>
  );
}
