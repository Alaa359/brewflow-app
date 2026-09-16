import { z } from 'zod';

function toQuantity(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isFinite(n) || n <= 0 || n > 999.999) return null;
  return Math.round(n * 1000) / 1000;
}

const quantityField = z
  .any()
  .refine((v) => toQuantity(v) !== null, {
    message: 'Quantité invalide (doit être comprise entre 0.001 et 999.999).',
  })
  .transform((v) => toQuantity(v) as number);

export const recipeLineSchema = z.object({
  ingredientId: z.string().min(1, 'Choisissez un ingrédient.'),
  quantityNeeded: quantityField,
});

export const recipeSchema = z
  .array(recipeLineSchema)
  .max(50, 'Maximum 50 ingrédients par recette.');

export type RecipeLineData = z.infer<typeof recipeSchema>;
