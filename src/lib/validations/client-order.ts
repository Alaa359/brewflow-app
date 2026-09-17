import { z } from 'zod';

export const tableTokenSchema = z.string().trim().uuid('Lien invalide.');

export const clientOrderItemsSchema = z
  .array(
    z.object({
      dishId: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
    })
  )
  .min(1, 'Le panier est vide.')
  .max(50, 'Trop d’articles dans le panier.');

export type ClientOrderLine = z.infer<typeof clientOrderItemsSchema>[number];
