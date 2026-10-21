import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/** Every screen except sign-in needs a (mock) session. */
export default async function SignedInLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())) redirect("/");
  return children;
}
