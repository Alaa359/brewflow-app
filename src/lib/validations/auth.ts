import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Adresse email invalide.').trim().toLowerCase(),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.email('Adresse email invalide.').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
  establishmentName: z
    .string()
    .trim()
    .min(2, "Le nom de l'établissement doit contenir au moins 2 caractères."),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});
