import type { ReactNode } from "react";

/**
 * Screen title in Instrument Serif, with an optional kicker line above (date, class · project)
 * and a sub line below. Pass `accent` to italicize one word of the title in primary.
 */
export function ScreenHeader({
  title,
  accent,
  kicker,
  sub,
  actions,
}: {
  /** Wireframe screen ID, kept for reference only. */
  id?: string;
  title: string;
  accent?: string;
  kicker?: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  const parts = accent ? title.split(accent) : [title];
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        {kicker && <p className="text-[15px] text-muted">{kicker}</p>}
        <h1 className="mt-0.5 font-serif text-[39px] font-normal leading-[1.02] tracking-[-0.015em]">
          {accent && parts.length > 1 ? (
            <>
              {parts[0]}
              <em className="text-primary">{accent}</em>
              {parts.slice(1).join(accent)}
            </>
          ) : (
            title
          )}
        </h1>
        {sub && <p className="mt-1 text-ink-2">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}
