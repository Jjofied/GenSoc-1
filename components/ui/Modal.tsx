"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Confirm dialog built on <dialog>: focus is trapped, Esc closes. */
export function Modal({
  open,
  title,
  onClose,
  children,
  actions,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
  actions: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="modal-title"
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-[18px] border-[1.5px] border-ink bg-white p-6 text-ink shadow-hard-lg backdrop:bg-ink/40"
    >
      <h2 id="modal-title" className="mb-2 text-2xl font-bold">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-ink-2">{children}</div>
      <div className="mt-5 flex flex-wrap justify-end gap-2.5">{actions}</div>
    </dialog>
  );
}
