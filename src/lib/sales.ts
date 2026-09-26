import { createDateFormatter } from '@/lib/i18n/format';

export const DEFAULT_TIMEZONE = 'Africa/Tunis';

const partsFormatters = new Map<string, Intl.DateTimeFormat>();
const dayFormatters = new Map<string, Intl.DateTimeFormat>();

export function normalizeTimezone(timezone?: string | null): string {
  if (!timezone) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone });
    return timezone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function partsFormatter(timezone: string): Intl.DateTimeFormat {
  const tz = normalizeTimezone(timezone);
  let formatter = partsFormatters.get(tz);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    partsFormatters.set(tz, formatter);
  }
  return formatter;
}

function dayFormatter(timezone: string): Intl.DateTimeFormat {
  const tz = normalizeTimezone(timezone);
  let formatter = dayFormatters.get(tz);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dayFormatters.set(tz, formatter);
  }
  return formatter;
}

function readInt(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const found = parts.find((part) => part.type === type);
  return Number(found?.value ?? 0);
}

function calendarParts(date: Date, timezone: string): { y: number; m: number; d: number } {
  const parts = partsFormatter(timezone).formatToParts(date);
  return { y: readInt(parts, 'year'), m: readInt(parts, 'month'), d: readInt(parts, 'day') };
}

function offsetMs(at: Date, timezone: string): number {
  const parts = partsFormatter(timezone).formatToParts(at);
  const asUtc = Date.UTC(
    readInt(parts, 'year'),
    readInt(parts, 'month') - 1,
    readInt(parts, 'day'),
    readInt(parts, 'hour'),
    readInt(parts, 'minute'),
    readInt(parts, 'second')
  );
  const aligned = Math.floor(at.getTime() / 1000) * 1000;
  return asUtc - aligned;
}

function localMidnightUtc(y: number, m: number, d: number, timezone: string): Date {
  const tz = normalizeTimezone(timezone);
  const utcGuess = Date.UTC(y, m - 1, d, 0, 0, 0);
  const firstPass = new Date(utcGuess - offsetMs(new Date(utcGuess), tz));
  return new Date(utcGuess - offsetMs(firstPass, tz));
}

function startOfCalendarDay(date: Date, timezone: string): Date {
  const { y, m, d } = calendarParts(date, timezone);
  return localMidnightUtc(y, m, d, timezone);
}

export function startOfDayTunisia(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  return startOfCalendarDay(date, timezone);
}

export function todayTunisia(date: Date = new Date(), timezone: string = DEFAULT_TIMEZONE): Date {
  return startOfCalendarDay(date, timezone);
}

export function toDateInputTunisia(
  date: Date = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): string {
  return dayFormatter(timezone).format(date);
}

export function isoDayStartInTz(
  isoDate: string,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) {
    return startOfCalendarDay(new Date(), timezone);
  }
  return localMidnightUtc(y, m, d, timezone);
}

export function formatTime(date: Date, locale = 'fr', timezone: string = DEFAULT_TIMEZONE): string {
  return createDateFormatter(locale, {
    timeZone: normalizeTimezone(timezone),
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatDateTime(
  date: Date,
  locale = 'fr',
  timezone: string = DEFAULT_TIMEZONE
): string {
  return createDateFormatter(locale, {
    timeZone: normalizeTimezone(timezone),
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export type Period = 'jour' | 'semaine' | 'mois';

export function startOfWeekTunisia(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const { y, m, d } = calendarParts(date, timezone);
  const noon = new Date(Date.UTC(y, m - 1, d, 12));
  const offsetDays = (noon.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(y, m - 1, d - offsetDays, 12));
  return localMidnightUtc(
    monday.getUTCFullYear(),
    monday.getUTCMonth() + 1,
    monday.getUTCDate(),
    timezone
  );
}

export function startOfMonthTunisia(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const { y, m } = calendarParts(date, timezone);
  return localMidnightUtc(y, m, 1, timezone);
}

export function periodStart(
  period: Period,
  now: Date = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): Date {
  if (period === 'jour') return startOfDayTunisia(now, timezone);
  if (period === 'semaine') return startOfWeekTunisia(now, timezone);
  return startOfMonthTunisia(now, timezone);
}
