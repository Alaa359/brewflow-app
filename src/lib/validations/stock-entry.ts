import { z } from 'zod';
import { startOfDayTunisia, todayTunisia } from '@/lib/sales';

function parseQuantity(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || value === undefined) return null;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 1000) / 1000;
}

const quantityField = z
  .any()
  .refine((v) => parseQuantity(v) !== null, {
    message: 'La quantité doit être supérieure à zéro.',
  })
  .transform((v) => parseQuantity(v) as number);

function toLocalDate(value: unknown): Date | null {
  if (value === '' || value === null || value === undefined) {
    return todayTunisia();
  }
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isFuture(date: Date): boolean {
  return startOfDayTunisia(date).getTime() > todayTunisia().getTime();
}

const dateField = z
  .any()
  .refine((v) => toLocalDate(v) !== null, { message: 'Date invalide.' })
  .refine(
    (v) => !(toLocalDate(v) !== null && isFuture(toLocalDate(v) as Date)),
    {
      message: 'La date ne peut pas être dans le futur.',
    }
  )
  .transform((v) => toLocalDate(v) as Date);

export const stockEntrySchema = z.object({
  quantityAdded: quantityField,
  supplierName: z
    .string()
    .trim()
    .max(80, 'Fournisseur invalide (80 caractères maximum).')
    .transform((v) => (v === '' ? null : v))
    .optional(),
  date: dateField,
});

export type StockEntryFormData = z.infer<typeof stockEntrySchema>;
