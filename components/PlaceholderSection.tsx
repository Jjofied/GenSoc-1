import type { ReactNode } from "react";

/** Grey box standing in for a section Claude Design will replace. */
export function PlaceholderSection({
  title,
  notes,
  children,
}: {
  title: string;
  notes?: string[];
  children?: ReactNode;
}) {
  return (
    <section className="mb-4 rounded-lg border border-dashed border-stone-300 bg-white p-4">
      <h2 className="mb-2 font-medium">{title}</h2>
      {notes && (
        <ul className="mb-2 list-disc pl-5 text-sm text-stone-600">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}
