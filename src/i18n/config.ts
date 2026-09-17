export const locales = ['fr', 'en', 'ar'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const LOCALE_COOKIE = 'locale';

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeCookieOptions = {
  path: '/',
  sameSite: 'lax',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: LOCALE_MAX_AGE,
} as const;

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && locales.includes(value as Locale);
}

export function localeDirection(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
