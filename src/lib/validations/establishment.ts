import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

export function createEstablishmentSchema(t: MessageTranslator) {
  return z.object({
    name: z.string().trim().min(2, t('establishment.nameTooShort')),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    timezone: z.string().trim().min(1, t('establishment.timezoneRequired')),
  });
}
