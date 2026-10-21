import { cn } from "@/lib/cn";
import type { GroupStatus } from "@/lib/types";

// Color + dot + text label: status is never shown by color alone.
export const GROUP_STATUS: Record<GroupStatus, { label: string; tone: string; dot: string }> = {
  full: { label: "Full", tone: "bg-ok-bg text-ok", dot: "bg-ok-dot" },
  open: { label: "Open seats", tone: "bg-warn-bg text-warn", dot: "bg-warn-dot" },
  "not-full-started": { label: "Not full – project started", tone: "bg-bad-bg text-bad", dot: "bg-bad-dot" },
};

export function GroupStatusLabel({ status, suffix }: { status: GroupStatus; suffix?: string }) {
  const { label, tone, dot } = GROUP_STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-bold", tone)}>
      <span aria-hidden className={cn("h-[7px] w-[7px] flex-none rounded-full", dot)} />
      {label}
      {suffix && ` · ${suffix}`}
    </span>
  );
}

export function StatusLegend() {
  return (
    <ul aria-label="Table status key" className="flex flex-wrap gap-2">
      {(Object.keys(GROUP_STATUS) as GroupStatus[]).map((s) => (
        <li key={s}>
          <GroupStatusLabel status={s} />
        </li>
      ))}
    </ul>
  );
}
