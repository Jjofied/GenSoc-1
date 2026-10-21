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
    "min-h-12 w-full rounded-xl bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-muted-2 focus:shadow-[2px_2px_0_var(--color-primary)] focus:outline-none",
    error ? "border-2 border-bad-dot shadow-hard-sm" : "border-[1.5px] border-ink shadow-hard-sm",
  );
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="text-[13px] font-bold text-ink-2">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} rows={3} aria-invalid={!!error} aria-describedby={describedBy} className={control} {...props} />
      ) : (
        <input id={id} aria-invalid={!!error} aria-describedby={describedBy} className={control} {...props} />
      )}
      {error && (
        <p id={`${id}-err`} className="flex items-center gap-1.5 text-sm font-bold text-bad">
          <span aria-hidden className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-bad-dot text-[11px] text-white">!</span>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
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
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 text-[15px]", disabled && "cursor-not-allowed opacity-60")}>
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
          "relative h-7 w-12 flex-none rounded-full border-[1.5px] border-ink shadow-hard-sm transition-colors",
          "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
          checked ? "bg-primary" : "bg-mint-2",
        )}
      >
        <span className={cn("absolute top-[3px] h-[18px] w-[18px] rounded-full border-[1.5px] border-ink bg-white transition-all", checked ? "left-[23px]" : "left-[3px]")} />
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
      <span className="text-[15px] font-semibold">{label}</span>
      <div role="group" aria-label={label} className="flex items-center rounded-full border-[1.5px] border-ink bg-white shadow-hard-sm">
        <button type="button" aria-label={`Fewer: ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="h-11 w-11 rounded-full text-lg font-bold hover:bg-mint-hover disabled:opacity-30">
          −
        </button>
        <output aria-live="polite" className="w-8 text-center font-mono text-base font-bold">
          {value}
        </output>
        <button type="button" aria-label={`More: ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="h-11 w-11 rounded-full text-lg font-bold hover:bg-mint-hover disabled:opacity-30">
          +
        </button>
      </div>
    </div>
  );
}
