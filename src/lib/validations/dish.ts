import { z } from 'zod';

function toDecimal(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 1000) / 1000;
}

const priceField = z
  .any()
  .refine((v) => toDecimal(v) !== null, {
    message: 'Prix invalide (doit être supérieur à zéro).',
  })
  .transform((v) => toDecimal(v) as number);

export const dishSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire.')
    .max(60, 'Maximum 60 caractères.'),
  description: z
    .union([
      z.literal(''),
      z.string().trim().max(200, 'Maximum 200 caractères.'),
    ])
    .optional()
    .transform((v) => (v === undefined || v === '' ? null : v)),
  price: priceField,
  categoryId: z.string().min(1, 'Choisissez une catégorie.'),
  isActive: z
    .enum(['true', 'false'], { message: 'Statut invalide.' })
    .transform((v) => v === 'true'),
});

export type DishFormData = z.infer<typeof dishSchema>;
