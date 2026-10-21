"use client";

import type { ReactNode } from "react";
import { useViewAs } from "@/lib/view-as";
import type { UserType } from "@/lib/types";

/** Renders children only for the given user type (mock auth). */
export function ForView({ type, children }: { type: UserType; children: ReactNode }) {
  return useViewAs() === type ? <>{children}</> : null;
}
