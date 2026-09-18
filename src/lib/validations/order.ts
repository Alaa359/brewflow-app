import { z } from 'zod';
import type { MessageTranslator } from '@/lib/i18n/translator';

export function createOrderIdSchema(t: MessageTranslator) {
  return z.string().min(1, t('order.invalidOrder'));
}

export function createOrderTargetStatusSchema(t: MessageTranslator) {
  return z.enum(['CONFIRMEE', 'EN_PREPARATION', 'PRETE'], {
    message: t('order.invalidStatus'),
  });
}

export type OrderTargetStatus = z.infer<
  ReturnType<typeof createOrderTargetStatusSchema>
>;
