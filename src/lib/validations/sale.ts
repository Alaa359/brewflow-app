import { z } from 'zod';

export const paymentMethodSchema = z.enum(['CASH', 'STRIPE'], {
  message: 'Méthode de paiement invalide.',
});

export const amountReceivedSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim().replace(',', '.');
    if (trimmed === '') return NaN;
    return Number(trimmed);
  },
  z
    .number('Montant reçu invalide.')
    .finite('Montant reçu invalide.')
    .min(0, 'Montant reçu invalide.')
    .max(1_000_000, 'Montant reçu trop élevé.')
    .refine(
      (value) => Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-9,
      'Le montant accepte 3 décimales maximum.'
    )
);

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
