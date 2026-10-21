import { AppShell } from "@/components/shell/AppShell";
import { ModeProvider } from "@/lib/app-mode";
import { DemoProvider } from "@/lib/demo-store";
import { DEMO_SESSION_COOKIE, readSessionCookie } from "@/lib/session";

// /demo: dummy data only. No Supabase keys, no sign-in. Defaults to the student view.
export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const viewAs = (await readSessionCookie(DEMO_SESSION_COOKIE)) ?? "student";
  return (
    <ModeProvider mode="demo">
      <DemoProvider initialViewAs={viewAs} sessionCookie={DEMO_SESSION_COOKIE}>
        <AppShell>{children}</AppShell>
      </DemoProvider>
    </ModeProvider>
  );
}
