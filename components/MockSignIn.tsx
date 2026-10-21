"use client";

import { useRouter } from "next/navigation";
import type { UserType } from "@/lib/types";
import { setViewAs } from "@/lib/view-as";

/** Stand-in for real sign-in: picks a mock user type and goes to its dashboard. */
export function MockSignIn() {
  const router = useRouter();
  const signIn = (type: UserType) => {
    setViewAs(type);
    router.push(`/${type}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => signIn("student")} className="rounded bg-stone-900 px-4 py-2 text-sm text-white">
        Sign in (mock student)
      </button>
      <button type="button" onClick={() => signIn("admin")} className="rounded border border-stone-400 px-4 py-2 text-sm">
        Sign in (mock admin)
      </button>
    </div>
  );
}
