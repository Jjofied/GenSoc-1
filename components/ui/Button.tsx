import { AppLink as Link } from "@/lib/app-mode";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Kind = "primary" | "secondary" | "ghost" | "dashed";

// Primary = lavender pill + 3px hard shadow; secondary = white + 2px; dashed = "create" / unselected.
const KIND: Record<Kind, string> = {
  primary: "press border-ink bg-primary text-white shadow-hard hover:bg-primary-hover hover:shadow-hard-sm",
  secondary: "press border-ink bg-white text-ink shadow-hard-sm hover:shadow-none",
  ghost: "border-transparent bg-transparent text-ink underline underline-offset-4 hover:text-muted",
  dashed: "border-dashed border-muted-line bg-white text-ink hover:border-solid hover:border-ink",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] px-[18px] text-[15px] font-bold " +
  "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-45";

const small = "min-h-9 px-3.5 text-sm";

export function Button({
  kind = "secondary",
  small: isSmall,
  className,
  ...props
}: ComponentProps<"button"> & { kind?: Kind; small?: boolean }) {
  return <button type="button" className={cn(base, KIND[kind], isSmall && small, className)} {...props} />;
}

export function LinkButton({
  href,
  kind = "secondary",
  small: isSmall,
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
    <Link href={href} className={cn(base, KIND[kind], isSmall && small, className)}>
      {children}
    </Link>
  );
}

/** Bold underlined text link to another screen ("See all tables →"). */
export function GoLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("text-[15px] font-bold text-ink underline underline-offset-4 hover:text-muted", className)}>
      {children} →
    </Link>
  );
}
