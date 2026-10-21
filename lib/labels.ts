import type { CalendarEventType, PostType } from "./types";

// Shapes stand in for color in low-fi.
export const POST_TYPE: Record<PostType, { glyph: string; label: string }> = {
  announcement: { glyph: "◇", label: "Announcement" },
  file: { glyph: "▤", label: "File" },
  meeting: { glyph: "□", label: "Meeting" },
  deadline: { glyph: "■", label: "Deadline" },
};

export const EVENT_TYPE: Record<CalendarEventType, { glyph: string; label: string }> = {
  meeting: { glyph: "□", label: "Meeting" },
  deadline: { glyph: "■", label: "Deadline" },
  "project-start": { glyph: "▷", label: "Project start" },
};
