import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

function toTableNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isInteger(n) || n < 1 || n > 999) return null;
  return n;
}

function numberField(t: MessageTranslator) {
  return z
    .any()
    .refine((v) => toTableNumber(v) !== null, {
      message: t('table.invalidNumber'),
    })
    .transform((v) => toTableNumber(v) as number);
}

export function createTableSchema(t: MessageTranslator) {
  return z.object({
    number: numberField(t),
    zone: z.string().trim().max(40, t('table.zoneMax')).optional(),
  });
}

export type TableFormData = z.infer<ReturnType<typeof createTableSchema>>;