import { z } from 'zod';

export const tableTokenSchema = z.string().trim().min(1, 'Lien invalide.');

export const clientOrderItemsSchema = z
  .array(
    z.object({
      dishId: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
    })
  )
  .min(1, 'Le panier est vide.');

export type ClientOrderLine = z.infer<typeof clientOrderItemsSchema>[number];
