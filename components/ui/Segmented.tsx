"use client";

import { cn } from "@/lib/cn";

/**
 * A row of mutually exclusive options (filters, Month/Week, Student/Teacher).
 * Selected = white + ink outline + hard shadow; unselected = dashed, transparent.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex flex-wrap gap-2", className)}>
      {options.map(([v, text]) => {
        const on = value === v;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(v)}
            className={cn(
              "min-h-11 rounded-full border-[1.5px] px-4 text-[15px]",
              on
                ? "border-ink bg-white font-bold text-ink shadow-hard-sm"
                : "border-dashed border-muted-2 bg-transparent font-semibold text-muted-2 hover:border-solid hover:border-ink hover:text-ink",
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
