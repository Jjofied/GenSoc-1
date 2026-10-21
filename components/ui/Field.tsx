"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  error,
  hint,
  className,
  multiline,
  ...props
}: (ComponentProps<"input"> & ComponentProps<"textarea">) & {
  label: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
}) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const control = cn(
    "w-full rounded-md border-[1.5px] bg-white px-3 py-2 text-sm placeholder:text-muted",
    error ? "border-ink border-2" : "border-line",
  );
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="text-xs font-semibold text-ink-2">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} rows={3} aria-invalid={!!error} aria-describedby={describedBy} className={control} {...props} />
      ) : (
        <input id={id} aria-invalid={!!error} aria-describedby={describedBy} className={control} {...props} />
      )}
      {error && (
        <p id={`${id}-err`} className="flex items-center gap-1.5 text-xs font-semibold">
          <span aria-hidden className="grid h-4 w-4 place-items-center rounded border-2 border-ink text-[10px]">!</span>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-2.5 text-sm", disabled && "cursor-not-allowed opacity-60")}>
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          "relative mt-0.5 h-5 w-9 flex-none rounded-full border-[1.5px] border-ink transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
          checked ? "bg-ink" : "bg-white",
        )}
      >
        <span className={cn("absolute top-0.5 h-3 w-3 rounded-full transition-all", checked ? "left-[18px] bg-white" : "left-0.5 bg-ink")} />
      </span>
      <span>{label}</span>
    </label>
  );
}

export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <div role="group" aria-label={label} className="flex items-center rounded-md border-[1.5px] border-ink bg-white">
        <button type="button" aria-label={`Fewer: ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="h-8 w-8 font-bold disabled:opacity-30">
          −
        </button>
        <output aria-live="polite" className="w-8 text-center font-mono text-sm font-bold">
          {value}
        </output>
        <button type="button" aria-label={`More: ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="h-8 w-8 font-bold disabled:opacity-30">
          +
        </button>
      </div>
    </div>
  );
}
