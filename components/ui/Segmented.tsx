"use client";

import { cn } from "@/lib/cn";

/** A row of mutually exclusive options (filters, Month/Week, Student/Teacher). */
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
    <div role="group" aria-label={label} className={cn("inline-flex flex-wrap rounded-md border-[1.5px] border-ink bg-white p-0.5", className)}>
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "rounded px-3 py-1.5 text-sm font-semibold",
            value === v ? "bg-ink text-white" : "text-ink hover:bg-fill-soft",
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
