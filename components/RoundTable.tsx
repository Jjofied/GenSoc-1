import { cn } from "@/lib/cn";
import type { Role, Seat } from "@/lib/types";

/**
 * A group drawn as a round table with seats around it. Decorative only:
 * the member list next to it carries the same information for screen readers.
 */
export function RoundTable({
  label,
  seats,
  roleOf,
  youId,
  size = "md",
}: {
  label: string;
  seats: Seat[];
  roleOf?: (studentId: string) => Role | undefined;
  youId?: string;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? 96 : 150;
  const radius = box / 2 - (size === "sm" ? 11 : 16);
  return (
    <div aria-hidden className="relative mx-auto flex-none" style={{ width: box, height: box }}>
      <div
        className={cn(
          "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-fill-soft text-center font-bold",
          size === "sm" ? "h-11 w-11 text-[9px]" : "h-[72px] w-[72px] text-xs",
        )}
      >
        {label}
      </div>
      {seats.map((seat, i) => {
        const angle = (i / seats.length) * Math.PI * 2 - Math.PI / 2;
        const role = seat.studentId ? roleOf?.(seat.studentId) : undefined;
        const you = !!youId && seat.studentId === youId;
        return (
          <span
            key={seat.index}
            className={cn(
              "absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono font-bold",
              size === "sm" ? "h-5 w-5 text-[7px]" : "h-8 w-8 text-[10px]",
              seat.studentId ? "border-[1.5px] border-ink bg-white" : "border-[1.5px] border-dashed border-line bg-paper",
              you && "bg-ink text-white",
            )}
            style={{ left: box / 2 + radius * Math.cos(angle), top: box / 2 + radius * Math.sin(angle) }}
          >
            {role?.icon ?? ""}
          </span>
        );
      })}
    </div>
  );
}
