import { cn } from "@/lib/cn";
import type { Role } from "@/lib/types";

/**
 * Neutral role glyph. Solid ring = done or assigned, dashed = not yet.
 * Every role looks the same apart from its glyph: no gendered colors.
 */
export function RoleIcon({ role, dashed, size = "md" }: { role: Role; dashed?: boolean; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid flex-none place-items-center rounded-full border-ink font-mono font-bold leading-none",
        dashed ? "border-[1.5px] border-dashed" : "border-[1.5px]",
        size === "sm" && "h-5 w-5 text-[8px]",
        size === "md" && "h-6 w-6 text-[10px]",
        size === "lg" && "h-10 w-10 border-2 text-sm",
      )}
    >
      {role.icon}
    </span>
  );
}

export function RoleChip({
  role,
  dashed,
  size = "md",
  shared,
  edited,
}: {
  role: Role;
  /** Not done yet / still to try. */
  dashed?: boolean;
  size?: "md" | "lg";
  shared?: boolean;
  /** Changed by the teacher (override). */
  edited?: boolean;
}) {
  return (
    <span
      title={role.focus}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full bg-white pr-2.5 font-medium text-ink",
        dashed ? "border-[1.5px] border-dashed border-line" : "border-[1.5px] border-line",
        size === "lg" ? "py-1 pl-1 text-lg font-bold" : "py-0.5 pl-0.5 text-xs",
      )}
    >
      <RoleIcon role={role} dashed={dashed} size={size === "lg" ? "lg" : "sm"} />
      <span className="truncate">{role.name}</span>
      {shared && <span className="text-muted">· shared</span>}
      {edited && (
        <span className="text-muted" title="Changed by teacher">
          ✎<span className="sr-only"> changed by teacher</span>
        </span>
      )}
    </span>
  );
}
