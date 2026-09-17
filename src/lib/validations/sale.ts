import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

export function createPaymentMethodSchema(t: MessageTranslator) {
  return z.enum(['CASH', 'STRIPE'], {
    message: t('sale.invalidPaymentMethod'),
  });
}

export function createAmountReceivedSchema(t: MessageTranslator) {
  return z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim().replace(',', '.');
      if (trimmed === '') return NaN;
      return Number(trimmed);
    },
    z
      .number(t('sale.invalidAmountReceived'))
      .finite(t('sale.invalidAmountReceived'))
      .min(0, t('sale.invalidAmountReceived'))
      .max(1_000_000, t('sale.amountTooHigh'))
      .refine(
        (value) => Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-9,
        t('sale.threeDecimalsMax')
      )
  );
}

export function createSaleItemSchema(t: MessageTranslator) {
  return z.object({
    dishId: z.string().min(1, t('sale.invalidArticle')),
    quantity: z
      .number()
      .int(t('sale.invalidQuantity'))
      .min(1, t('sale.invalidQuantity'))
      .max(99, t('sale.quantityTooHigh')),
  });
}

export function createSaleItemsSchema(t: MessageTranslator) {
  return z
    .array(createSaleItemSchema(t))
    .min(1, t('sale.cartEmpty'))
    .max(50, t('sale.cartTooMany'));
}

export function createTableIdSchema(t: MessageTranslator) {
  return z.string().min(1, t('sale.tableRequired'));
}

export type SaleItem = z.infer<ReturnType<typeof createSaleItemSchema>>;
export type PaymentMethodValue = z.infer<
  ReturnType<typeof createPaymentMethodSchema>
>;