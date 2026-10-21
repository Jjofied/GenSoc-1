import type { GroupStatus } from "@/lib/types";

// Color is a hint only; the text label always carries the meaning.
const STATUS: Record<GroupStatus, { label: string; dot: string }> = {
  full: { label: "Full", dot: "bg-green-600" },
  open: { label: "Open seats", dot: "bg-amber-500" },
  "not-full-started": { label: "Not full – project started", dot: "bg-red-600" },
};

export function GroupStatusLabel({ status }: { status: GroupStatus }) {
  const { label, dot } = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white px-2 py-0.5 text-xs">
      <span aria-hidden className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
