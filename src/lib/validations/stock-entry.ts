import { z } from 'zod';
import {
  DEFAULT_TIMEZONE,
  isoDayStartInTz,
  toDateInputTunisia,
  todayTunisia,
} from '@/lib/sales';
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

function toIsoDate(value: unknown, timezone: string): string | null {
  if (value === '' || value === null || value === undefined) {
    return toDateInputTunisia(new Date(), timezone);
  }
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

function isFuture(iso: string, timezone: string): boolean {
  return (
    isoDayStartInTz(iso, timezone).getTime() >
    todayTunisia(new Date(), timezone).getTime()
  );
}

function dateField(t: MessageTranslator, timezone: string) {
  return z
    .any()
    .refine((v) => toIsoDate(v, timezone) !== null, {
      message: t('stockEntry.invalidDate'),
    })
    .refine(
      (v) => {
        const iso = toIsoDate(v, timezone);
        return iso === null || !isFuture(iso, timezone);
      },
      {
        message: t('stockEntry.dateNotFuture'),
      }
    )
    .transform((v) => isoDayStartInTz(toIsoDate(v, timezone)!, timezone));
}

export function createStockEntrySchema(
  t: MessageTranslator,
  timezone: string = DEFAULT_TIMEZONE
) {
  return z.object({
    quantityAdded: quantityField(t),
    supplierName: z
      .string()
      .trim()
      .max(80, t('stockEntry.supplierInvalid'))
      .transform((v) => (v === '' ? null : v))
      .optional(),
    date: dateField(t, timezone),
  });
}

export type StockEntryFormData = z.infer<
  ReturnType<typeof createStockEntrySchema>
>;
