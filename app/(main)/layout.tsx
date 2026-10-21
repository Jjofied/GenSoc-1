import { AppShell } from "@/components/shell/AppShell";
import { ModeProvider } from "@/lib/app-mode";
import { DemoProvider } from "@/lib/demo-store";
import { LIVE_SESSION_COOKIE, readSessionCookie } from "@/lib/session";

// Main app. Still runs on the in-memory store + mock session for now.
// Next brief: replace DemoProvider with the Supabase-backed provider and real sign-in.
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await readSessionCookie(LIVE_SESSION_COOKIE);
  return (
    <ModeProvider mode="live">
      <DemoProvider initialViewAs={session} sessionCookie={LIVE_SESSION_COOKIE}>
        <AppShell>{children}</AppShell>
      </DemoProvider>
    </ModeProvider>
  );
}
