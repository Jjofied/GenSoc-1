import type { CalendarEventType, PostType, Role } from "./types";

/** Colors for a type tile or event pill: background, glyph/text, border. */
export interface TypeTone {
  bg: string;
  fg: string;
  border: string;
}

export const POST_TYPE: Record<PostType, { glyph: string; label: string } & TypeTone> = {
  announcement: { glyph: "✦", label: "Announcement", bg: "var(--color-mint-2)", fg: "var(--color-ink)", border: "1.5px solid var(--color-mint-2)" },
  file: { glyph: "▤", label: "File", bg: "#fff", fg: "var(--color-ink)", border: "1.5px solid var(--color-ink)" },
  meeting: { glyph: "◷", label: "Meeting", bg: "#fff", fg: "var(--color-ink)", border: "1.5px solid var(--color-ink)" },
  deadline: { glyph: "⚑", label: "Deadline", bg: "var(--color-ink)", fg: "#fff", border: "1.5px solid var(--color-ink)" },
};

// Calendar types: shape + color + label, never color alone.
export const EVENT_TYPE: Record<CalendarEventType, { glyph: string; label: string } & TypeTone> = {
  meeting: { glyph: "◷", label: "Meeting", bg: "oklch(0.94 0.035 235)", fg: "oklch(0.32 0.08 235)", border: "1.5px solid oklch(0.55 0.1 235)" },
  deadline: { glyph: "⚑", label: "Deadline", bg: "oklch(0.42 0.12 300)", fg: "#fff", border: "1.5px solid oklch(0.42 0.12 300)" },
  "project-start": {
    glyph: "▶",
    label: "Project start",
    bg: "repeating-linear-gradient(45deg,oklch(0.92 0.05 160) 0 5px,#fff 5px 10px)",
    fg: "oklch(0.3 0.07 160)",
    border: "1.5px dashed oklch(0.5 0.09 160)",
  },
};

// Hue per role glyph (hi-fi spec): tile oklch(0.92 0.05 H), glyph oklch(0.42 0.1 H).
const ROLE_HUE: Record<string, number> = { "★": 60, "</>": 265, "◫": 305, "✓": 190, "¶": 115, "▶": 225 };

/** Hue for a role's chip, or null for custom roles (shown neutral). */
export function roleHue(role: Pick<Role, "icon">): number | null {
  return ROLE_HUE[role.icon] ?? null;
}
