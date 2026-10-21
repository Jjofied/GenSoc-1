import type { Role } from "@/lib/types";

/** Neutral chip for a group role. Same look for every role — no gendered colors. */
export function RoleChip({ role, shared }: { role: Role; shared?: boolean }) {
  return (
    <span
      title={role.focus}
      className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-800"
    >
      {role.name}
      {shared && <span className="text-stone-500">(shared)</span>}
    </span>
  );
}
