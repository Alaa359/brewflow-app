import { z } from 'zod';

export const establishmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom de l'établissement doit contenir au moins 2 caractères."),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  timezone: z.string().trim().min(1, 'Le fuseau horaire est requis.'),
});
