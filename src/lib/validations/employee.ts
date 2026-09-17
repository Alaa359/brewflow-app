import { z } from 'zod';

export const employeeRoles = ['ADMIN', 'SERVER', 'KITCHEN'] as const;

export type EmployeeRole = (typeof employeeRoles)[number];

export const employeeSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().trim().email('Email invalide.').toLowerCase(),
  role: z.enum(employeeRoles, { message: 'Rôle invalide.' }),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
});

export const employeeUpdateSchema = employeeSchema.extend({
  password: z
    .string()
    .refine(
      (value) => value === '' || value.length >= 8,
      'Le mot de passe doit contenir au moins 8 caractères.'
    ),
});
