import { z } from 'zod';

function toTableNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isInteger(n) || n < 1 || n > 999) return null;
  return n;
}

const numberField = z
  .any()
  .refine((v) => toTableNumber(v) !== null, {
    message: 'Numéro invalide (1 à 999).',
  })
  .transform((v) => toTableNumber(v) as number);

export const tableSchema = z.object({
  number: numberField,
  zone: z.string().trim().max(40, 'Maximum 40 caractères.').optional(),
});

export type TableFormData = z.infer<typeof tableSchema>;
