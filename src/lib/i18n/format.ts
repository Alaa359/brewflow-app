import type { Locale } from '@/i18n/config';

const LOCALE_TAG: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-TN',
};

export const DEFAULT_CURRENCY_LABEL = 'DT';

export function localeTag(locale: string): string {
  return LOCALE_TAG[locale as Locale] ?? LOCALE_TAG.fr;
}

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function numberFormatter(
  locale: string,
  options: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const tag = localeTag(locale);
  const key = `${tag}|${JSON.stringify(options)}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(tag, options);
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

function dateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const tag = localeTag(locale);
  const key = `${tag}|${JSON.stringify(options)}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(tag, options);
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

export function formatNumber(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions = {}
): string {
  return numberFormatter(locale, options).format(value);
}

export function formatDecimal(value: number, locale: string): string {
  return formatNumber(value, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

export function formatCurrency(
  value: number,
  locale: string,
  currencyLabel: string = DEFAULT_CURRENCY_LABEL
): string {
  return `${formatDecimal(value, locale)} ${currencyLabel}`;
}

export function formatPercent(
  value: number,
  locale: string,
  fractionDigits = 1
): string {
  return formatNumber(value, locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
): string {
  return dateFormatter(locale, options).format(date);
}

export function formatDayMonth(date: Date, locale: string): string {
  return dateFormatter(locale, { day: '2-digit', month: 'short' }).format(date);
}

export function formatWeekday(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit' }
): string {
  return dateFormatter(locale, options).format(date);
}

export function formatTime(date: Date, locale: string): string {
  return dateFormatter(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatDateTime(date: Date, locale: string): string {
  return dateFormatter(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
