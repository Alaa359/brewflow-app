import { createDateFormatter } from '@/lib/i18n/format';

const LOCAL_TIME_ZONE = 'Africa/Tunis';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: LOCAL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function startOfDayTunisia(date: Date): Date {
  const [year, month, day] = dateFormatter.format(date).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function todayTunisia(date: Date = new Date()): Date {
  return startOfDayTunisia(date);
}

export function toDateInputTunisia(date: Date = new Date()): string {
  return dateFormatter.format(date);
}

export function formatTime(date: Date, locale = 'fr'): string {
  return createDateFormatter(locale, {
    timeZone: LOCAL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatDateTime(date: Date, locale = 'fr'): string {
  return createDateFormatter(locale, {
    timeZone: LOCAL_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export type Period = 'jour' | 'semaine' | 'mois';

const DAY_MS = 86_400_000;

export function startOfWeekTunisia(date: Date): Date {
  const start = startOfDayTunisia(date);
  const offset = (start.getUTCDay() + 6) % 7;
  return new Date(start.getTime() - offset * DAY_MS);
}

export function startOfMonthTunisia(date: Date): Date {
  const [year, month] = dateFormatter.format(date).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

export function periodStart(period: Period, now: Date = new Date()): Date {
  if (period === 'jour') return startOfDayTunisia(now);
  if (period === 'semaine') return startOfWeekTunisia(now);
  return startOfMonthTunisia(now);
}
