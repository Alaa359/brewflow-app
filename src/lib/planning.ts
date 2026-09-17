import { createDateFormatter } from '@/lib/i18n/format';

export function todayInTZ(timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const buffer: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') buffer[part.type] = part.value;
  }
  return `${buffer.year}-${buffer.month}-${buffer.day}`;
}

export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function mondayOfWeek(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return '';
  const toMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - toMonday);
  return date.toISOString().slice(0, 10);
}

export type WeekDay = {
  iso: string;
  dow: number;
  dayNumber: number;
};

export function weekDays(monday: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const iso = addDays(monday, index);
    const date = parseISODate(iso)!;
    return {
      iso,
      dow: (date.getUTCDay() + 6) % 7,
      dayNumber: date.getUTCDate(),
    };
  });
}

export function formatDateLabel(iso: string, locale = 'fr'): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return createDateFormatter(locale, {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatWeekRange(monday: string, locale = 'fr'): string {
  const mondayDate = parseISODate(monday);
  const sundayDate = parseISODate(addDays(monday, 6));
  if (!mondayDate || !sundayDate) return '';

  const monthFormatter = createDateFormatter(locale, {
    timeZone: 'UTC',
    month: 'long',
  });
  const mondayDay = mondayDate.getUTCDate();
  const sundayDay = sundayDate.getUTCDate();
  const sameMonth = mondayDate.getUTCMonth() === sundayDate.getUTCMonth();
  const year = sundayDate.getUTCFullYear();
  if (sameMonth) {
    return `${mondayDay} – ${sundayDay} ${monthFormatter.format(sundayDate)} ${year}`;
  }
  return `${mondayDay} ${monthFormatter.format(mondayDate)} – ${sundayDay} ${monthFormatter.format(sundayDate)} ${year}`;
}
