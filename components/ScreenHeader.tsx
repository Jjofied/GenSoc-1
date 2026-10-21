import type { ReactNode } from "react";

/** Screen title, one-line context, and the WF ID from the wireframe spec. */
export function ScreenHeader({
  id,
  title,
  sub,
  actions,
}: {
  id: string;
  title: string;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <span title="Wireframe screen ID" className="rounded border-[1.5px] border-ink bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold">
          {id}
        </span>
      </div>
    </header>
  );
}
