import { z } from 'zod';

function toInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

const sortOrderField = z
  .any()
  .refine((v) => toInt(v) !== null, { message: 'Ordre invalide.' })
  .transform((v) => toInt(v) as number);

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire.')
    .max(40, 'Maximum 40 caractères.'),
  sortOrder: sortOrderField,
});

export type CategoryFormData = z.infer<typeof categorySchema>;
