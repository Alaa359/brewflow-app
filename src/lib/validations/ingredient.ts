import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

function toDecimal(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return 0;
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 1000) / 1000;
}

const decimalField = (message: string) =>
  z
    .any()
    .refine((v) => toDecimal(v) !== null, { message })
    .transform((v) => toDecimal(v) as number);

export function createIngredientSchema(t: MessageTranslator) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('ingredient.nameRequired'))
      .max(60, t('ingredient.nameMax')),
    unit: z.enum(['KG', 'L', 'PIECE'], {
      message: t('ingredient.invalidUnit'),
    }),
    currentStock: decimalField(t('ingredient.invalidStock')),
    minThreshold: decimalField(t('ingredient.invalidThreshold')),
    costPerUnit: decimalField(t('ingredient.invalidCost')),
  });
}

export type IngredientFormData = z.infer<
  ReturnType<typeof createIngredientSchema>
>;
