import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

function toQuantity(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isFinite(n) || n <= 0 || n > 999.999) return null;
  return Math.round(n * 1000) / 1000;
}

function quantityField(t: MessageTranslator) {
  return z
    .any()
    .refine((v) => toQuantity(v) !== null, {
      message: t('recipe.invalidQuantity'),
    })
    .transform((v) => toQuantity(v) as number);
}

export function createRecipeLineSchema(t: MessageTranslator) {
  return z.object({
    ingredientId: z.string().min(1, t('recipe.ingredientRequired')),
    quantityNeeded: quantityField(t),
  });
}

export function createRecipeSchema(t: MessageTranslator) {
  return z
    .array(createRecipeLineSchema(t))
    .max(50, t('recipe.tooManyIngredients'));
}

export type RecipeLineData = z.infer<ReturnType<typeof createRecipeSchema>>;