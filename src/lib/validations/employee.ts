import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

export const employeeRoles = ['ADMIN', 'SERVER', 'KITCHEN'] as const;

export type EmployeeRole = (typeof employeeRoles)[number];

export function createEmployeeSchema(t: MessageTranslator) {
  return z.object({
    name: z.string().trim().min(2, t('employee.nameTooShort')),
    email: z.string().trim().email(t('employee.emailInvalid')).toLowerCase(),
    role: z.enum(employeeRoles, { message: t('employee.invalidRole') }),
    password: z.string().min(8, t('employee.passwordTooShort')),
  });
}

export function createEmployeeUpdateSchema(t: MessageTranslator) {
  return createEmployeeSchema(t).extend({
    password: z
      .string()
      .refine(
        (value) => value === '' || value.length >= 8,
        t('employee.passwordTooShort')
      ),
  });
}