import { z } from 'zod';

export const orderIdSchema = z.string().min(1, 'Commande invalide.');

export const orderTargetStatusSchema = z.enum(
  ['CONFIRMEE', 'EN_PREPARATION', 'PRETE'],
  { message: 'Statut invalide.' }
);

export type OrderTargetStatus = z.infer<typeof orderTargetStatusSchema>;
