import { z } from 'zod';

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

export const ingredientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire.')
    .max(60, 'Maximum 60 caractères.'),
  unit: z.enum(['KG', 'L', 'PIECE'], { message: 'Unité invalide.' }),
  currentStock: decimalField('Stock invalide.'),
  minThreshold: decimalField('Seuil invalide.'),
  costPerUnit: decimalField('Coût invalide.'),
});

export type IngredientFormData = z.infer<typeof ingredientSchema>;
