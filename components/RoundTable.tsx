import { RoleIcon } from "@/components/RoleChip";
import { cn } from "@/lib/cn";
import type { Role, Seat } from "@/lib/types";

type Size = "sm" | "md" | "lg";

// [box w, box h, seat px, seat ring radius as % of box]. lg = the HF07 table card.
const GEOMETRY: Record<Size, { w: number; h: number; seat: number; disc: number; ring: number }> = {
  sm: { w: 96, h: 96, seat: 20, disc: 44, ring: 38 },
  md: { w: 150, h: 150, seat: 30, disc: 72, ring: 39 },
  lg: { w: 260, h: 250, seat: 40, disc: 92, ring: 39 },
};

const initials = (name: string) =>
  name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2);

/**
 * A group drawn as a round table: mint disc in the middle, seats around it.
 *
 * sm / md (dashboards, setup): decorative only, each seat is the member's role tile;
 * the list next to it carries the same information for screen readers.
 *
 * lg (round table screen): pass `nameOf` to show initials + name under each seat with a role
 * badge, and `onSit` to turn empty seats into "Sit here" buttons. Then it is real content.
 */
export function RoundTable({
  label,
  seats,
  roleOf,
  youId,
  size = "md",
  nameOf,
  onSit,
  sitLabel = "Sit here",
  sitDisabled,
  tableName,
}: {
  label: string;
  seats: Seat[];
  roleOf?: (studentId: string) => Role | undefined;
  youId?: string;
  size?: Size;
  /** lg only: show initials + names. */
  nameOf?: (studentId: string) => string;
  /** lg only: empty seats become buttons. */
  onSit?: (seatIndex: number) => void;
  /** Text on empty seats ("Sit here", "Open", "Empty"). */
  sitLabel?: string;
  sitDisabled?: boolean;
  /** lg only: the table's name for screen readers when the center label differs ("Your table"). */
  tableName?: string;
}) {
  const g = GEOMETRY[size];
  const big = size === "lg";
  const pos = (i: number) => {
    const a = (i / seats.length) * Math.PI * 2 - Math.PI / 2;
    return { left: `${50 + g.ring * Math.cos(a)}%`, top: `${50 + g.ring * Math.sin(a)}%` };
  };

  return (
    <div
      aria-hidden={big ? undefined : true}
      role={big ? "group" : undefined}
      aria-label={big ? `${tableName ?? label} seats` : undefined}
      className="relative mx-auto max-w-full flex-none"
      style={{ width: g.w, height: g.h }}
    >
      <div
        className={cn(
          "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[1.5px] border-ink bg-mint-2 text-center font-bold text-ink-2",
          size === "sm" ? "text-[9px] leading-tight" : "text-[13px] leading-tight",
        )}
        style={{ width: g.disc, height: g.disc }}
      >
        {label}
      </div>

      {seats.map((seat, i) => {
        const role = seat.studentId ? roleOf?.(seat.studentId) : undefined;
        const you = !!youId && seat.studentId === youId;

        if (!big) {
          // Compact seat: the role tile itself, or a plain / dashed circle.
          return (
            <span
              key={seat.index}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={pos(i)}
            >
              {role ? (
                <span className={cn("grid place-items-center rounded-full", you && "outline-2 outline-offset-1 outline-ink")}>
                  <RoleIcon role={role} size={size === "sm" ? "sm" : "md"} />
                </span>
              ) : (
                <span
                  className={cn(
                    "block rounded-full border-[1.5px]",
                    seat.studentId ? "border-ink bg-white" : "border-dashed border-muted-line bg-white",
                    you && "bg-ink",
                  )}
                  style={{ width: size === "sm" ? 20 : 24, height: size === "sm" ? 20 : 24 }}
                />
              )}
            </span>
          );
        }

        const name = seat.studentId ? nameOf?.(seat.studentId) ?? "" : "";
        return (
          <div
            key={seat.index}
            className="absolute flex w-[76px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-center"
            style={pos(i)}
          >
            {seat.studentId ? (
              <>
                <span
                  aria-hidden
                  title={role ? `${name} · ${role.name}` : name}
                  className={cn(
                    "relative inline-grid place-items-center rounded-full border-[1.5px] border-ink text-[13px] font-bold",
                    you ? "bg-ink text-white" : "bg-white text-ink",
                  )}
                  style={{ width: g.seat, height: g.seat }}
                >
                  {initials(name)}
                  {role && (
                    <span className="absolute -bottom-[5px] -right-[7px] leading-none">
                      <RoleIcon role={role} size="sm" />
                    </span>
                  )}
                </span>
                <span aria-hidden className={cn("whitespace-nowrap text-xs leading-[1.15]", you && "font-bold")}>
                  {you ? "You" : name}
                </span>
                <span className="sr-only">
                  {you ? `You (${name})` : name}
                  {role ? `, ${role.name}` : ""}
                </span>
              </>
            ) : onSit ? (
              <button
                type="button"
                disabled={sitDisabled}
                onClick={() => onSit(seat.index)}
                aria-label={sitDisabled ? "Open seat" : `${sitLabel} at ${tableName ?? label}`}
                className={cn(
                  "h-11 w-[68px] rounded-full border-[1.5px] border-dashed border-muted-line bg-white text-xs font-bold leading-[1.1]",
                  sitDisabled ? "cursor-not-allowed text-muted-line" : "cursor-pointer text-ink hover:bg-mint-hover",
                )}
              >
                {sitLabel}
              </button>
            ) : (
              <span className="grid h-11 w-[68px] place-items-center rounded-full border-[1.5px] border-dashed border-muted-line bg-white text-xs font-bold text-muted-line">
                {sitLabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
