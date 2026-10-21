import type { ReactNode } from "react";

export function ScreenHeader({
  id,
  title,
  who,
  children,
}: {
  id: string;
  title: string;
  who?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <p className="mb-1 inline-block rounded bg-stone-800 px-2 py-0.5 font-mono text-xs text-white">
        {id}
      </p>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {who && <p className="text-sm text-stone-500">For: {who}</p>}
      {children && <div className="mt-2 text-stone-700">{children}</div>}
    </header>
  );
}
