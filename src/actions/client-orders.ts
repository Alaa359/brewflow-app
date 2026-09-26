'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { Prisma } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import {
  createClientOrderItemsSchema,
  createTableTokenSchema,
  type ClientOrderLine,
} from '@/lib/validations/client-order';

export type ClientOrderErrors = {
  items?: string[];
  form?: string[];
};

export type ClientOrderState =
  | {
      errors?: ClientOrderErrors;
      message?: string;
      success?: boolean;
      orderId?: string;
    }
  | undefined;

function consolidate(items: ClientOrderLine[]): ClientOrderLine[] {
  const merged = new Map<string, number>();
  for (const item of items) {
    merged.set(item.dishId, (merged.get(item.dishId) ?? 0) + item.quantity);
  }
  return [...merged.entries()].map(([dishId, quantity]) => ({
    dishId,
    quantity,
  }));
}

export async function submitTableOrder(
  _prev: ClientOrderState,
  formData: FormData
): Promise<ClientOrderState> {
  const t = await getTranslations('Feedback.orders');
  const tValidation = await getTranslations('Validation');

  const tokenParsed = createTableTokenSchema(tValidation).safeParse(
    formData.get('token')
  );
  if (!tokenParsed.success) {
    return {
      errors: { form: [t('invalidLink')] },
      message: t('orderFailed'),
    } satisfies ClientOrderState;
  }

  const table = await prisma.table.findUnique({
    where: { qrCode: tokenParsed.data },
    select: { id: true, establishmentId: true },
  });
  if (!table) {
    return {
      errors: { form: [t('tableUnavailable')] },
      message: t('orderFailed'),
    } satisfies ClientOrderState;
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get('items') ?? ''));
  } catch {
    return {
      errors: { items: [t('cartInvalid')] },
      message: t('orderFailed'),
    } satisfies ClientOrderState;
  }

  const itemsParsed =
    createClientOrderItemsSchema(tValidation).safeParse(rawItems);
  if (!itemsParsed.success) {
    const empty = Array.isArray(rawItems) && rawItems.length === 0;
    return {
      errors: {
        items: [empty ? t('cartEmpty') : t('cartItemInvalid')],
      },
      message: t('orderFailed'),
    } satisfies ClientOrderState;
  }

  const lines = consolidate(itemsParsed.data);

  const dishes = await prisma.dish.findMany({
    where: {
      id: { in: lines.map((line) => line.dishId) },
      establishmentId: table.establishmentId,
      isActive: true,
    },
    select: { id: true, price: true },
  });
  if (dishes.length !== lines.length) {
    return {
      errors: {
        items: [t('dishUnavailable')],
      },
      message: t('orderFailed'),
    } satisfies ClientOrderState;
  }

  const dishById = new Map(dishes.map((dish) => [dish.id, dish]));
  const totalAmount = lines.reduce(
    (acc, line) => acc.add(dishById.get(line.dishId)!.price.mul(line.quantity)),
    new Prisma.Decimal(0)
  );

  const order = await prisma.order.create({
    data: {
      tableId: table.id,
      status: 'EN_ATTENTE',
      totalAmount,
      paymentMethod: null,
      userId: null,
      orderItems: {
        create: lines.map((line) => ({
          dishId: line.dishId,
          quantity: line.quantity,
          unitPrice: dishById.get(line.dishId)!.price,
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath('/caisse/pos');
  return {
    success: true,
    message: t('sent'),
    orderId: order.id,
  } satisfies ClientOrderState;
}
