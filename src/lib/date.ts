export const APP_TIMEZONE = "America/Sao_Paulo";

export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export const WEEKDAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const WEEKDAY_LABEL_PT: Record<Weekday, string> = {
  mon: "Seg",
  tue: "Ter",
  wed: "Qua",
  thu: "Qui",
  fri: "Sex",
  sat: "Sáb",
  sun: "Dom",
};

const isoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
});

/** Calendar day (YYYY-MM-DD) in the app timezone for a given instant (default: now). */
export function toISODate(date: Date = new Date()): string {
  return isoFormatter.format(date);
}

/** Weekday of an already-computed YYYY-MM-DD calendar date (timezone-agnostic: dates are pure calendar values). */
export function weekdayOf(isoDate: string): Weekday {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return weekdayFormatter.format(d).toLowerCase() as Weekday;
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Monday of the Mon-Sun week containing isoDate. */
export function startOfWeek(isoDate: string): string {
  const idx = WEEKDAY_ORDER.indexOf(weekdayOf(isoDate));
  return addDays(isoDate, -idx);
}

export function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

export function diffDays(fromISO: string, toISO: string): number {
  const a = new Date(`${fromISO}T12:00:00Z`).getTime();
  const b = new Date(`${toISO}T12:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function daysBetween(fromISO: string, toISOInclusive: string): string[] {
  const days: string[] = [];
  let cursor = fromISO;
  while (cursor <= toISOInclusive) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}
