import { AppLink as Link } from "@/lib/app-mode";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Kind = "primary" | "secondary" | "ghost";

const KIND: Record<Kind, string> = {
  primary: "bg-ink text-white border-ink hover:bg-ink-2",
  secondary: "bg-white text-ink border-ink hover:bg-fill-soft",
  ghost: "bg-transparent text-ink border-transparent hover:bg-fill-soft",
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md border-[1.5px] px-3.5 py-2 text-sm font-semibold " +
  "disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45";

export function Button({
  kind = "secondary",
  small,
  className,
  ...props
}: ComponentProps<"button"> & { kind?: Kind; small?: boolean }) {
  return (
    <button
      type="button"
      className={cn(base, KIND[kind], small && "px-2.5 py-1 text-xs", className)}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  kind = "secondary",
  small,
  className,
  children,
}: {
  href: string;
  kind?: Kind;
  small?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, KIND[kind], small && "px-2.5 py-1 text-xs", className)}>
      {children}
    </Link>
  );
}

/** Text link to another screen, in the canvas's "→ WF07" style. */
export function GoLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "font-mono text-xs font-semibold text-accent underline decoration-dashed underline-offset-4 hover:text-accent-strong",
        className,
      )}
    >
      {children} →
    </Link>
  );
}
