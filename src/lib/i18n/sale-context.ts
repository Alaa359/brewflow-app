import { getLocale, getTranslations } from 'next-intl/server';
import { formatQuantity } from '@/lib/ingredients';
import type { SaleContext } from '@/lib/sales-core';

export async function getSaleContext(): Promise<SaleContext> {
  const [t, tUnits, locale] = await Promise.all([
    getTranslations('Feedback.sales'),
    getTranslations('Units'),
    getLocale(),
  ]);

  return {
    t,
    formatQuantity: (value, unit) =>
      formatQuantity(value, unit, locale, tUnits(unit)),
  };
}
