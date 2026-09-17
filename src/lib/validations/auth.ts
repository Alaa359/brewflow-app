import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

export function createLoginSchema(t: MessageTranslator) {
  return z.object({
    email: z.email(t('auth.login.emailInvalid')).trim().toLowerCase(),
    password: z.string().min(1, t('auth.login.passwordRequired')),
  });
}

export function createRegisterSchema(t: MessageTranslator) {
  return z.object({
    name: z.string().trim().min(2, t('auth.register.nameTooShort')),
    email: z.email(t('auth.register.emailInvalid')).trim().toLowerCase(),
    password: z.string().min(8, t('auth.register.passwordTooShort')),
    establishmentName: z
      .string()
      .trim()
      .min(2, t('auth.register.establishmentNameTooShort')),
    address: z.string().trim().optional(),
    phone: z.string().trim().optional(),
  });
}