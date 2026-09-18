import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

function toDecimal(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 1000) / 1000;
}

function priceField(t: MessageTranslator) {
  return z
    .any()
    .refine((v) => toDecimal(v) !== null, {
      message: t('dish.priceInvalid'),
    })
    .transform((v) => toDecimal(v) as number);
}

export function createDishSchema(t: MessageTranslator) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('dish.nameRequired'))
      .max(60, t('dish.nameMax')),
    description: z
      .union([
        z.literal(''),
        z.string().trim().max(200, t('dish.descriptionMax')),
      ])
      .optional()
      .transform((v) => (v === undefined || v === '' ? null : v)),
    price: priceField(t),
    categoryId: z.string().min(1, t('dish.categoryRequired')),
    isActive: z
      .enum(['true', 'false'], { message: t('dish.invalidStatus') })
      .transform((v) => v === 'true'),
  });
}

export type DishFormData = z.infer<ReturnType<typeof createDishSchema>>;
