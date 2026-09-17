'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { OrderStatus, Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { canTransition } from '@/lib/order-flow';
import { transitionOrderStatus } from '@/lib/orders';
import type { MessageTranslator } from '@/lib/i18n/translator';
import { getSaleContext } from '@/lib/i18n/sale-context';
import {
  createOrderIdSchema,
  createOrderTargetStatusSchema,
} from '@/lib/validations/order';
import { createAmountReceivedSchema } from '@/lib/validations/sale';
import {
  SaleValidationError,
  StockCheckError,
  settleOrder,
} from '@/lib/sales-core';

export type OrderActionErrors = {
  orderId?: string[];
  amountReceived?: string[];
  form?: string[];
};

export type OrderActionState =
  | {
      errors?: OrderActionErrors;
      message?: string;
      success?: boolean;
      status?: OrderStatus;
      orderId?: string;
    }
  | undefined;

function mapOrderError(error: unknown, t: MessageTranslator): OrderActionState {
  if (error instanceof StockCheckError) {
    return {
      errors: { form: [error.message] },
      message: t('settleFailed'),
    } satisfies OrderActionState;
  }
  if (error instanceof SaleValidationError) {
    return {
      errors: { form: error.errors },
      message: error.message,
    } satisfies OrderActionState;
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2034'
  ) {
    return {
      errors: { form: [t('settleRetry')] },
      message: t('settleFailed'),
    } satisfies OrderActionState;
  }
  throw error;
}

export async function advanceOrderStatus(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const user = await requireRole(Role.SERVER, Role.ADMIN, Role.KITCHEN);
  const t = await getTranslations('Feedback.orders');
  const tStatus = await getTranslations('OrderStatus');
  const tValidation = await getTranslations('Validation');

  const orderParsed = createOrderIdSchema(tValidation).safeParse(
    formData.get('orderId')
  );
  const targetParsed = createOrderTargetStatusSchema(tValidation).safeParse(
    formData.get('status')
  );
  if (!orderParsed.success || !targetParsed.success) {
    return {
      errors: { form: [t('invalidAction')] },
      message: t('actionFailed'),
    } satisfies OrderActionState;
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderParsed.data,
      table: { establishmentId: user.establishmentId },
    },
    select: { id: true, status: true },
  });
  if (!order) {
    return {
      errors: { orderId: [t('orderNotFound')] },
      message: t('actionFailed'),
    } satisfies OrderActionState;
  }

  if (!canTransition(order.status, targetParsed.data, user.role)) {
    return {
      errors: { form: [t('forbidden')] },
      message: t('actionFailed'),
    } satisfies OrderActionState;
  }

  const ok = await transitionOrderStatus(
    order.id,
    user.establishmentId,
    order.status,
    targetParsed.data
  );
  if (!ok) {
    return {
      errors: { form: [t('statusChanged')] },
      message: t('actionFailed'),
    } satisfies OrderActionState;
  }

  revalidatePath('/caisse');
  revalidatePath('/cuisine');
  return {
    success: true,
    status: targetParsed.data,
    message: t('statusAdvanced', {
      status: tStatus(targetParsed.data).toLowerCase(),
    }),
  } satisfies OrderActionState;
}

export async function settlePendingOrder(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const user = await requireRole(Role.SERVER, Role.ADMIN);
  const t = await getTranslations('Feedback.orders');
  const tValidation = await getTranslations('Validation');
  const saleContext = await getSaleContext();

  const orderParsed = createOrderIdSchema(tValidation).safeParse(
    formData.get('orderId')
  );
  if (!orderParsed.success) {
    return {
      errors: { orderId: [t('invalidOrder')] },
      message: t('settleFailed'),
    } satisfies OrderActionState;
  }

  const receivedParsed = createAmountReceivedSchema(tValidation).safeParse(
    formData.get('amountReceived')
  );
  if (!receivedParsed.success) {
    return {
      errors: {
        amountReceived: receivedParsed.error.issues.map((i) => i.message),
      },
      message: t('settleFailed'),
    } satisfies OrderActionState;
  }

  let orderId: string;
  try {
    orderId = await settleOrder(
      {
        orderId: orderParsed.data,
        method: 'CASH',
        establishmentId: user.establishmentId,
        userId: user.id,
        amountReceived: new Prisma.Decimal(receivedParsed.data),
        allowedStatuses: ['PRETE'],
      },
      saleContext
    );
  } catch (error) {
    return mapOrderError(error, t);
  }

  revalidatePath('/caisse');
  revalidatePath('/cuisine');
  return {
    success: true,
    orderId,
    status: 'PAYEE',
    message: t('settled'),
  } satisfies OrderActionState;
}
