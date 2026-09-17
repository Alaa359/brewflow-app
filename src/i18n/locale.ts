'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE, isLocale, localeCookieOptions } from './config';

export async function setUserLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, localeCookieOptions);
  revalidatePath('/', 'layout');
}
