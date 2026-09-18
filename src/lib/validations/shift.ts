import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

export const DAY_NAMES = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const shiftPresets = [
  { id: 'MATIN', label: 'Matin', startTime: '08:00', endTime: '14:00' },
  {
    id: 'APRES_MIDI',
    label: 'Après-midi',
    startTime: '14:00',
    endTime: '18:00',
  },
  { id: 'SOIR', label: 'Soir', startTime: '18:00', endTime: '22:00' },
] as const;

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function createShiftSchema(t: MessageTranslator) {
  return z
    .object({
      employeeId: z.string().min(1, t('shift.employeeRequired')),
      dayOfWeek: z.coerce.number().int().min(0).max(6, t('shift.invalidDay')),
      startTime: z.string().regex(TIME_RE, t('shift.invalidStartTime')),
      endTime: z.string().regex(TIME_RE, t('shift.invalidEndTime')),
    })
    .refine((shift) => shift.startTime < shift.endTime, {
      path: ['endTime'],
      message: t('shift.endAfterStart'),
    });
}
