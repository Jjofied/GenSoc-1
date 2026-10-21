import Link from "next/link";

export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-[15px] font-bold">
      <span aria-hidden className="h-3.5 w-3.5 rounded-full border-[3.5px] border-ink" />
      groupme
    </Link>
  );
}
