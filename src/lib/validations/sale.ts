import { z } from 'zod';

export const paymentMethodSchema = z.enum(['CASH', 'STRIPE'], {
  message: 'Méthode de paiement invalide.',
});

export const amountReceivedSchema = z.coerce
  .number()
  .min(0, 'Montant reçu invalide.')
  .max(1_000_000, 'Montant reçu trop élevé.')
  .multipleOf(0.001, 'Le montant accepte 3 décimales maximum.')
  .refine((value) => !Number.isNaN(value), 'Montant reçu invalide.');

export const saleItemSchema = z.object({
  dishId: z.string().min(1, 'Article invalide.'),
  quantity: z
    .number()
    .int('Quantité invalide.')
    .min(1, 'Quantité invalide.')
    .max(99, 'Quantité trop élevée.'),
});

export const saleItemsSchema = z
  .array(saleItemSchema)
  .min(1, 'Le panier est vide.')
  .max(50, 'Trop d’articles dans le panier.');

export const tableIdSchema = z.string().min(1, 'Sélectionnez une table.');

export type SaleItem = z.infer<typeof saleItemSchema>;
export type PaymentMethodValue = z.infer<typeof paymentMethodSchema>;
