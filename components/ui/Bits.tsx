import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { toDate } from "@/lib/format";

/** Labelled progress bar, e.g. "Roles you've done 2 of 6". */
export function ProgressBar({ label, value, note }: { label: ReactNode; value: number; note?: ReactNode }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-2 text-[15px]">
        <span>{label}</span>
        {note !== undefined && <b>{note}</b>}
      </div>
      <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={typeof label === "string" ? label : undefined} className="h-2.5 overflow-hidden rounded-full bg-mint-2">
        <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
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

/** Vertical steps. Filled dot = done, lavender ring = happening now, hollow = later. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
          {i < items.length - 1 && <span aria-hidden className="absolute left-[8px] top-5 h-full w-[1.5px] bg-ink/30" />}
          <span
            aria-hidden
            className={cn(
              "relative mt-0.5 h-[18px] w-[18px] flex-none rounded-full border-[1.5px] border-ink",
              item.current ? "bg-primary shadow-[0_0_0_4px_var(--color-lavender)]" : item.done ? "bg-ink" : "bg-white",
            )}
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-bold">{item.title}</span>
            {item.sub && <span className="text-[15px] text-muted">{item.sub}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function KeyValue({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
      {items.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="text-right font-bold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Small uppercase label, used above sections and on post types. */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-[13px] font-bold uppercase tracking-[0.06em] text-muted", className)}>{children}</span>;
}

/** Dashed box standing in for an image or QR code. */
export function ImagePlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("grid place-items-center rounded-xl border-[1.5px] border-dashed border-muted-line font-mono text-xs text-muted", className)}
      style={{ background: "repeating-linear-gradient(45deg,var(--color-mint-2) 0 6px,#fff 6px 12px)" }}
    >
      <span className="rounded bg-white px-1.5">{label}</span>
    </div>
  );
}

export function Avatar({ name, size = "md", you }: { name: string; size?: "sm" | "md" | "lg"; you?: boolean }) {
  const initials = name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2);
  return (
    <span
      aria-hidden
      className={cn(
        "grid flex-none place-items-center rounded-full border-[1.5px] border-ink font-bold",
        size === "sm" && "h-7 w-7 text-[11px]",
        size === "md" && "h-8 w-8 text-xs",
        size === "lg" && "h-9 w-9 text-[13px]",
        you ? "bg-ink text-white" : "bg-mint-2 text-ink",
      )}
    >
      {initials}
    </span>
  );
}

/**
 * 52×56 date tile: month + day. Deadlines are ink-filled, meetings white, undecided dashed.
 * Read as UTC, like every other date in lib/format.
 */
export function DateTile({ date, kind = "meeting", style }: { date: Date | string; kind?: "meeting" | "deadline" | "pending"; style?: CSSProperties }) {
  const d = typeof date === "string" ? toDate(date) : date;
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "flex h-14 w-[52px] flex-none flex-col items-center justify-center rounded-[10px] leading-[1.1]",
        kind === "deadline" && "border-[1.5px] border-ink bg-ink text-white",
        kind === "meeting" && "border-[1.5px] border-ink bg-white text-ink",
        kind === "pending" && "border-[1.5px] border-dashed border-muted text-ink",
      )}
    >
      <span className="text-xs font-bold uppercase">{d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}</span>
      <span className="text-xl font-bold">{d.getUTCDate()}</span>
    </span>
  );
}
