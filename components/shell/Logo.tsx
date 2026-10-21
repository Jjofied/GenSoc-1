import { AppLink as Link } from "@/lib/app-mode";
import { cn } from "@/lib/cn";

/** Ink ring + wordmark. `lg` is the sidebar / sign-in size. */
export function Logo({ href, size = "md" }: { href: string; size?: "md" | "lg" }) {
  return (
    <Link href={href} className={cn("flex items-center font-bold tracking-[-0.02em] text-ink", size === "lg" ? "gap-2.5 text-[22px]" : "gap-2 text-[19px]")}>
      <span aria-hidden className={cn("box-border flex-none rounded-full border-ink", size === "lg" ? "h-[22px] w-[22px] border-[5px]" : "h-[18px] w-[18px] border-4")} />
      groupme
    </Link>
  );
}
