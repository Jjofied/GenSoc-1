// "Today" in the school's time zone, so a project starting on Nov 16 rotates on Nov 16 locally,
// not on UTC's date. Set SCHOOL_TIME_ZONE to change it.

export const DEFAULT_SCHOOL_TIME_ZONE = "Asia/Manila";

export function schoolTimeZone(value = process.env.SCHOOL_TIME_ZONE): string {
  if (!value) return DEFAULT_SCHOOL_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return value;
  } catch {
    return DEFAULT_SCHOOL_TIME_ZONE;
  }
}

/** YYYY-MM-DD for `now` in the given time zone. */
export function todayIn(timeZone: string, now = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
