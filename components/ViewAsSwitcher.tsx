"use client";

import { setViewAs, showViewAsSwitcher, useViewAs } from "@/lib/view-as";
import type { UserType } from "@/lib/types";

const OPTIONS: { value: UserType; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "student", label: "Student" },
];

export function ViewAsSwitcher() {
  const viewAs = useViewAs();
  if (!showViewAsSwitcher) return null;

  return (
    <fieldset className="flex items-center gap-2 rounded border border-dashed border-stone-400 px-2 py-1 text-xs">
      <legend className="sr-only">Mock sign-in (dev only)</legend>
      <span className="text-stone-500">View as (dev):</span>
      {OPTIONS.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-1">
          <input
            type="radio"
            name="view-as"
            value={o.value}
            checked={viewAs === o.value}
            onChange={() => setViewAs(o.value)}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
