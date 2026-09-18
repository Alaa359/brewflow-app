import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

export function createTableTokenSchema(t: MessageTranslator) {
  return z.string().trim().uuid(t('clientOrder.invalidLink'));
}

export function createClientOrderItemsSchema(t: MessageTranslator) {
  return z
    .array(
      z.object({
        dishId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, t('clientOrder.cartEmpty'))
    .max(50, t('clientOrder.cartTooMany'));
}

export type ClientOrderLine = z.infer<
  ReturnType<typeof createClientOrderItemsSchema>
>[number];
