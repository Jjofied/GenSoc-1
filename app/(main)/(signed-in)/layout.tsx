import { redirect } from "next/navigation";
import { LIVE_SESSION_COOKIE, readSessionCookie } from "@/lib/session";

/** Every main screen except sign-in needs a (mock, for now) session. */
export default async function SignedInLayout({ children }: { children: React.ReactNode }) {
  if (!(await readSessionCookie(LIVE_SESSION_COOKIE))) redirect("/");
  return children;
}
