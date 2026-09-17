import { z } from 'zod';
import { parseISODate } from '@/lib/planning';

export const MAX_REPORT_DAYS = 366;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide.')
  .refine((value) => {
    const parsed = parseISODate(value);
    return parsed !== null && parsed.toISOString().slice(0, 10) === value;
  }, 'Date invalide.');

function spanInDays(from: string, to: string): number {
  const start = parseISODate(from);
  const end = parseISODate(to);
  if (!start || !end) return Number.POSITIVE_INFINITY;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export const reportRangeSchema = z
  .object({
    debut: isoDate,
    fin: isoDate,
  })
  .refine((value) => spanInDays(value.debut, value.fin) >= 0, {
    message: 'La date de début doit précéder la date de fin.',
    path: ['fin'],
  })
  .refine((value) => spanInDays(value.debut, value.fin) <= MAX_REPORT_DAYS, {
    message: `Période limitée à ${MAX_REPORT_DAYS} jours.`,
    path: ['fin'],
  });

export type ReportRange = z.infer<typeof reportRangeSchema>;
