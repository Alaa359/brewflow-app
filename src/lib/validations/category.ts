import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

function toInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

function sortOrderField(t: MessageTranslator) {
  return z
    .any()
    .refine((v) => toInt(v) !== null, { message: t('category.invalidOrder') })
    .transform((v) => toInt(v) as number);
}

export function createCategorySchema(t: MessageTranslator) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('category.nameRequired'))
      .max(40, t('category.nameMax')),
    sortOrder: sortOrderField(t),
  });
}

export type CategoryFormData = z.infer<ReturnType<typeof createCategorySchema>>;