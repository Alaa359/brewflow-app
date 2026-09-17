import { z } from 'zod';

export const DAY_NAMES = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

export const DAY_SHORT = [
  'lun.',
  'mar.',
  'mer.',
  'jeu.',
  'ven.',
  'sam.',
  'dim.',
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

export const shiftSchema = z
  .object({
    employeeId: z.string().min(1, 'Sélectionnez un employé.'),
    dayOfWeek: z.coerce
      .number()
      .int()
      .min(0)
      .max(6, 'Jour de la semaine invalide.'),
    startTime: z
      .string()
      .regex(TIME_RE, 'Heure de début invalide (format HH:mm).'),
    endTime: z.string().regex(TIME_RE, 'Heure de fin invalide (format HH:mm).'),
  })
  .refine((shift) => shift.startTime < shift.endTime, {
    path: ['endTime'],
    message: "L'heure de fin doit être postérieure à l'heure de début.",
  });
