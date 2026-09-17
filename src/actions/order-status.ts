'use server';

import { revalidatePath } from 'next/cache';
import { OrderStatus, Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { canTransition } from '@/lib/order-flow';
import { transitionOrderStatus } from '@/lib/orders';
import { ORDER_STATUS_LABEL } from '@/lib/sales';
import {
  orderIdSchema,
  orderTargetStatusSchema,
} from '@/lib/validations/order';
import { amountReceivedSchema } from '@/lib/validations/sale';
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

function mapOrderError(error: unknown): OrderActionState {
  if (error instanceof StockCheckError) {
    return {
      errors: { form: [error.message] },
      message: 'Encaissement impossible.',
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
      errors: { form: ['Encaissement en cours sur le même stock, réessayez.'] },
      message: 'Encaissement impossible.',
    } satisfies OrderActionState;
  }
  throw error;
}

export async function advanceOrderStatus(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const user = await requireRole(Role.SERVER, Role.ADMIN, Role.KITCHEN);

  const orderParsed = orderIdSchema.safeParse(formData.get('orderId'));
  const targetParsed = orderTargetStatusSchema.safeParse(
    formData.get('status')
  );
  if (!orderParsed.success || !targetParsed.success) {
    return {
      errors: { form: ['Action invalide.'] },
      message: 'Action impossible.',
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
      errors: { orderId: ['Commande introuvable.'] },
      message: 'Action impossible.',
    } satisfies OrderActionState;
  }

  if (!canTransition(order.status, targetParsed.data, user.role)) {
    return {
      errors: { form: ['Vous ne pouvez pas effectuer cette action.'] },
      message: 'Action impossible.',
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
      errors: { form: ['Le statut de cette commande a déjà changé.'] },
      message: 'Action impossible.',
    } satisfies OrderActionState;
  }

  revalidatePath('/caisse');
  revalidatePath('/cuisine');
  return {
    success: true,
    status: targetParsed.data,
    message: `Commande ${ORDER_STATUS_LABEL[targetParsed.data].toLowerCase()}.`,
  } satisfies OrderActionState;
}

export async function settlePendingOrder(
  _prev: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const user = await requireRole(Role.SERVER, Role.ADMIN);

  const orderParsed = orderIdSchema.safeParse(formData.get('orderId'));
  if (!orderParsed.success) {
    return {
      errors: { orderId: ['Commande invalide.'] },
      message: 'Encaissement impossible.',
    } satisfies OrderActionState;
  }

  const receivedParsed = amountReceivedSchema.safeParse(
    formData.get('amountReceived')
  );
  if (!receivedParsed.success) {
    return {
      errors: {
        amountReceived: receivedParsed.error.issues.map((i) => i.message),
      },
      message: 'Encaissement impossible.',
    } satisfies OrderActionState;
  }

  let orderId: string;
  try {
    orderId = await settleOrder({
      orderId: orderParsed.data,
      method: 'CASH',
      establishmentId: user.establishmentId,
      userId: user.id,
      amountReceived: new Prisma.Decimal(receivedParsed.data),
      allowedStatuses: ['PRETE'],
    });
  } catch (error) {
    return mapOrderError(error);
  }

  revalidatePath('/caisse');
  revalidatePath('/cuisine');
  return {
    success: true,
    orderId,
    status: 'PAYEE',
    message: 'Commande encaissée.',
  } satisfies OrderActionState;
}
