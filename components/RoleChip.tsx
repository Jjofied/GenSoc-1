import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { roleHue } from "@/lib/labels";
import type { Role } from "@/lib/types";

type Size = "sm" | "md" | "lg";

// [tile px, label px, glyph px] from the hi-fi RoleChip spec.
const SIZE: Record<Size, [number, number, number]> = { sm: [20, 13, 10], md: [24, 14, 12], lg: [36, 18, 16] };

/** Tile colors for a role: same hue everywhere the role appears. Unknown roles stay neutral. */
function tileStyle(role: Role, dashed: boolean | undefined, size: Size): CSSProperties {
  const h = roleHue(role);
  const [tile, , glyph] = SIZE[size];
  return {
    width: tile,
    height: tile,
    fontSize: glyph,
    background: dashed ? "#fff" : h == null ? "oklch(0.92 0 0)" : `oklch(0.92 0.05 ${h})`,
    color: h == null ? "oklch(0.42 0 0)" : `oklch(0.42 0.1 ${h})`,
    border: dashed
      ? `1.5px dashed ${h == null ? "var(--color-muted-line)" : `oklch(0.55 0.09 ${h})`}`
      : "1.5px solid var(--color-ink)",
  };
}

/** Round glyph tile for a role. Solid = done or assigned, dashed = not yet. */
export function RoleIcon({ role, dashed, size = "md" }: { role: Role; dashed?: boolean; size?: Size }) {
  return (
    <span
      aria-hidden
      style={tileStyle(role, dashed, size)}
      className="inline-grid flex-none place-items-center rounded-full font-mono font-bold leading-none tracking-[-0.06em]"
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
  size?: Size;
  shared?: boolean;
  /** Changed by the teacher (override). */
  edited?: boolean;
}) {
  return (
    <span
      title={role.focus}
      style={{ fontSize: SIZE[size][1] }}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full bg-white py-0.5 pl-0.5 pr-2.5 align-middle font-bold leading-[1.2]",
        dashed ? "border-[1.5px] border-dashed border-muted-line text-muted" : "border-[1.5px] border-ink text-ink shadow-hard-sm",
      )}
    >
      <RoleIcon role={role} dashed={dashed} size={size} />
      <span className="truncate">{role.name}</span>
      {shared && <span className="font-semibold text-muted">· shared</span>}
      {edited && (
        <span className="text-muted" title="Changed by teacher">
          ✎<span className="sr-only"> changed by teacher</span>
        </span>
      )}
    </span>
  );
}
