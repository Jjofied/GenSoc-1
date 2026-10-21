import type { GroupStatus } from "@/lib/types";

// Low-fi: shape + label carry the meaning. No color.
export const GROUP_STATUS: Record<GroupStatus, { label: string; shape: string }> = {
  full: { label: "Full", shape: "●" },
  open: { label: "Open seats", shape: "◐" },
  "not-full-started": { label: "Not full – project started", shape: "▲" },
};

export function GroupStatusLabel({ status }: { status: GroupStatus }) {
  const { label, shape } = GROUP_STATUS[status];
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded border-[1.5px] px-2 py-0.5 text-xs font-semibold " +
        (status === "not-full-started" ? "border-ink bg-ink text-white" : "border-line bg-white")
      }
    >
      <span aria-hidden>{shape}</span>
      {label}
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
