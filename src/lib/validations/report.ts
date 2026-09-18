import { z } from 'zod';
import { parseISODate } from '@/lib/planning';
import type { MessageTranslator } from '@/lib/i18n/translator';

export const MAX_REPORT_DAYS = 366;

function isoDate(t: MessageTranslator) {
  return z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, t('report.invalidDate'))
    .refine((value) => {
      const parsed = parseISODate(value);
      return parsed !== null && parsed.toISOString().slice(0, 10) === value;
    }, t('report.invalidDate'));
}

function spanInDays(from: string, to: string): number {
  const start = parseISODate(from);
  const end = parseISODate(to);
  if (!start || !end) return Number.POSITIVE_INFINITY;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function createReportRangeSchema(t: MessageTranslator) {
  return z
    .object({
      debut: isoDate(t),
      fin: isoDate(t),
    })
    .refine((value) => spanInDays(value.debut, value.fin) >= 0, {
      message: t('report.startBeforeEnd'),
      path: ['fin'],
    })
    .refine((value) => spanInDays(value.debut, value.fin) <= MAX_REPORT_DAYS, {
      message: t('report.maxDays', { days: MAX_REPORT_DAYS }),
      path: ['fin'],
    });
}

export type ReportRange = z.infer<ReturnType<typeof createReportRangeSchema>>;
