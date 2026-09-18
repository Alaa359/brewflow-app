import { z } from 'zod';
import { startOfDayTunisia, todayTunisia } from '@/lib/sales';
import type { MessageTranslator } from '@/lib/i18n/translator';

function parseQuantity(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 1000) / 1000;
}

function quantityField(t: MessageTranslator) {
  return z
    .any()
    .refine((v) => parseQuantity(v) !== null, {
      message: t('stockEntry.quantityPositive'),
    })
    .transform((v) => parseQuantity(v) as number);
}

function toLocalDate(value: unknown): Date | null {
  if (value === '' || value === null || value === undefined) {
    return todayTunisia();
  }
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isFuture(date: Date): boolean {
  return startOfDayTunisia(date).getTime() > todayTunisia().getTime();
}

function dateField(t: MessageTranslator) {
  return z
    .any()
    .refine((v) => toLocalDate(v) !== null, {
      message: t('stockEntry.invalidDate'),
    })
    .refine(
      (v) => !(toLocalDate(v) !== null && isFuture(toLocalDate(v) as Date)),
      {
        message: t('stockEntry.dateNotFuture'),
      }
    )
    .transform((v) => toLocalDate(v) as Date);
}

export function createStockEntrySchema(t: MessageTranslator) {
  return z.object({
    quantityAdded: quantityField(t),
    supplierName: z
      .string()
      .trim()
      .max(80, t('stockEntry.supplierInvalid'))
      .transform((v) => (v === '' ? null : v))
      .optional(),
    date: dateField(t),
  });
}

export type StockEntryFormData = z.infer<
  ReturnType<typeof createStockEntrySchema>
>;
