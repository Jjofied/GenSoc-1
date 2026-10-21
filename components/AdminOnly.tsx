import type { ReactNode } from "react";
import { ForView } from "./ForView";

/** Admin content, with the permission-denied state shown to students. */
export function AdminOnly({ children }: { children: ReactNode }) {
  return (
    <>
      <ForView type="admin">{children}</ForView>
      <ForView type="student">
        <p role="alert" className="rounded-lg border border-stone-300 bg-white p-4 text-sm">
          This page is for teachers. Ask your teacher if you need something changed here.
        </p>
      </ForView>
    </>
  );
}
