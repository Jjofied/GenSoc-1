// Date helpers. Mock dates have no time zone, so everything is read and shown as UTC
// to keep server and browser output identical.

import { TODAY } from "./mock-data";

export function toDate(iso: string): Date {
  if (iso.length === 10) return new Date(`${iso}T00:00:00Z`); // 2026-10-22
  if (iso.length === 16) return new Date(`${iso}:00Z`); // 2026-10-22T14:00
  return new Date(`${iso}Z`);
}

const fmt = (opts: Intl.DateTimeFormatOptions) => (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(toDate(iso));

/** Thu, Oct 22 */
export const dayLabel = fmt({ weekday: "short", month: "short", day: "numeric" });
/** Oct 22 */
export const shortDate = fmt({ month: "short", day: "numeric" });
/** OCT 22 */
export const stampDate = (iso: string) => shortDate(iso).toUpperCase();
/** THU */
export const weekdayShort = (iso: string) => fmt({ weekday: "short" })(iso).toUpperCase();
/** October 2026 */
export const monthLabel = fmt({ month: "long", year: "numeric" });

/** 2 PM, 11:59 PM */
export function timeLabel(iso: string): string {
  const d = toDate(iso);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

/** Thu, Oct 22 · 2 PM */
export const whenLabel = (iso: string) => `${dayLabel(iso)} · ${timeLabel(iso)}`;

export function daysFromToday(iso: string): number {
  return Math.round((toDate(iso.slice(0, 10)).getTime() - toDate(TODAY).getTime()) / 86_400_000);
}

/** "today", "1 day ago", "5 days ago" */
export function agoLabel(iso: string): string {
  const d = -daysFromToday(iso);
  if (d <= 0) return "today";
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** "Now" for new demo posts: the prototype's fixed today, mid-morning. */
export const TODAY_TIME = `${TODAY}T10:00`;
