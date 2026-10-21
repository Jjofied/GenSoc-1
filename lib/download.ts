// Client-only helpers for files the prototype hands to the viewer.

import { toDate } from "./format";
import type { CalendarEvent } from "./types";

export function downloadText(filename: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

/** Sample stand-in for a class file (the prototype has no real uploads). */
export function downloadSampleFile(name: string) {
  downloadText(`${name}.txt`, `Sample file for the groupme prototype.\nThe real file "${name}" would download here.\n`);
}

const icsStamp = (iso: string) => toDate(iso).toISOString().replace(/[-:]/g, "").slice(0, 15);

/** One event as an .ics file, in floating local time like the mock data. */
export function downloadIcs(event: CalendarEvent) {
  const start = icsStamp(event.start);
  const end = icsStamp(new Date(toDate(event.start).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16));
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//groupme//prototype//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@groupme.example`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title.replace(/[,;]/g, "\\$&")}`,
    ...(event.location ? [`LOCATION:${event.location.replace(/[,;]/g, "\\$&")}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  downloadText(`${event.id}.ics`, lines.join("\r\n"), "text/calendar");
}
