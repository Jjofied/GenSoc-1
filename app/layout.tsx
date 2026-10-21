import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { DemoProvider } from "@/lib/demo-store";
import { getSession } from "@/lib/session";
import "./globals.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: "groupme",
  description: "Fair roles. Every project.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        <DemoProvider initialViewAs={session}>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
