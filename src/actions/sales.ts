'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Prisma, Role, PaymentMethod } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import {
  createAmountReceivedSchema,
  createPaymentMethodSchema,
  createSaleItemsSchema,
  createTableIdSchema,
} from '@/lib/validations/sale';
import type { MessageTranslator } from '@/lib/i18n/translator';
import { getSaleContext } from '@/lib/i18n/sale-context';
import {
  buildSalePlan,
  consolidateItems,
  decrementStock,
  SALE_TX_OPTIONS,
  SaleValidationError,
  StockCheckError,
} from '@/lib/sales-core';
import {
  STRIPE_CURRENCY,
  getStripe,
  stripeConfigured,
  tndToEuroCents,
} from '@/lib/stripe';

export type SaleErrors = {
  items?: string[];
  tableId?: string[];
  amountReceived?: string[];
  form?: string[];
};

export type SaleState =
  | {
      errors?: SaleErrors;
      message?: string;
      success?: boolean;
      orderId?: string;
    }
  | undefined;

function formError(errors: SaleErrors['form'], message: string): SaleState {
  return { errors: { form: errors }, message } satisfies SaleState;
}

async function resolveSaleContext(
  formData: FormData,
  t: MessageTranslator,
  tValidation: MessageTranslator
) {
  const user = await requireRole(Role.SERVER, Role.ADMIN);

  const tableParsed = createTableIdSchema(tValidation).safeParse(
    formData.get('tableId')
  );
  if (!tableParsed.success) {
    return {
      user,
      error: {
        errors: { tableId: tableParsed.error.issues.map((i) => i.message) },
        message: t('saleFailed'),
      } satisfies SaleState,
    };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get('items') ?? ''));
  } catch {
    return {
      user,
      error: {
        errors: { items: [t('cartInvalid')] },
        message: t('saleFailed'),
      } satisfies SaleState,
    };
  }

  const itemsParsed = createSaleItemsSchema(tValidation).safeParse(rawItems);
  if (!itemsParsed.success) {
    const empty = Array.isArray(rawItems) && rawItems.length === 0;
    return {
      user,
      error: {
        errors: {
          items: [empty ? t('cartEmpty') : t('cartItemInvalid')],
        },
        message: t('saleFailed'),
      } satisfies SaleState,
    };
  }

  const table = await prisma.table.findFirst({
    where: {
      id: tableParsed.data,
      establishmentId: user.establishmentId,
    },
    select: { id: true },
  });
  if (!table) {
    return {
      user,
      error: {
        errors: { tableId: [t('unknownTable')] },
        message: t('saleFailed'),
      } satisfies SaleState,
    };
  }

  return {
    user,
    tableId: table.id,
    lines: consolidateItems(itemsParsed.data),
  };
}

function mapSaleError(error: unknown, t: MessageTranslator): SaleState {
  if (error instanceof StockCheckError) {
    return {
      errors: { form: [error.message] },
      message: t('saleFailed'),
    } satisfies SaleState;
  }
  if (error instanceof SaleValidationError) {
    return {
      errors: { form: error.errors },
      message: error.message,
    } satisfies SaleState;
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2034'
  ) {
    return formError([t('saleRetry')], t('saleFailed'));
  }
  throw error;
}

export async function validateSale(
  _prev: SaleState,
  formData: FormData
): Promise<SaleState> {
  const t = await getTranslations('Feedback.sales');
  const tValidation = await getTranslations('Validation');
  const saleContext = await getSaleContext();

  const context = await resolveSaleContext(formData, t, tValidation);
  if ('error' in context) return context.error;

  const methodParsed = createPaymentMethodSchema(tValidation).safeParse(
    formData.get('method')
  );
  if (!methodParsed.success) {
    return formError(
      methodParsed.error.issues.map((i) => i.message),
      t('saleFailed')
    );
  }
  const method = methodParsed.data;

  let amountReceived: Prisma.Decimal | null = null;
  if (method === PaymentMethod.CASH) {
    const receivedParsed = createAmountReceivedSchema(tValidation).safeParse(
      formData.get('amountReceived')
    );
    if (!receivedParsed.success) {
      return {
        errors: {
          amountReceived: receivedParsed.error.issues.map((i) => i.message),
        },
        message: t('checkoutFailed'),
      } satisfies SaleState;
    }
    amountReceived = new Prisma.Decimal(receivedParsed.data);
  }

  let orderId: string;
  try {
    orderId = await prisma.$transaction(async (tx) => {
      const plan = await buildSalePlan(
        tx,
        context.user.establishmentId,
        context.lines,
        saleContext
      );

      if (method === PaymentMethod.CASH) {
        if (!amountReceived!.gte(plan.totalAmount)) {
          throw new SaleValidationError(
            [t('amountInsufficient')],
            t('saleFailed')
          );
        }
        const order = await tx.order.create({
          data: {
            tableId: context.tableId,
            status: 'PAYEE',
            paymentMethod: 'CASH',
            totalAmount: plan.totalAmount,
            userId: context.user.id,
            orderItems: {
              create: context.lines.map((line) => ({
                dishId: line.dishId,
                quantity: line.quantity,
                unitPrice: plan.dishById.get(line.dishId)!.price,
              })),
            },
            payments: {
              create: {
                method: 'CASH',
                amount: plan.totalAmount,
                status: 'COMPLETED',
              },
            },
          },
          select: { id: true },
        });
        await decrementStock(
          tx,
          context.user.establishmentId,
          plan.needed,
          plan.ingredientMeta,
          plan.stockById,
          saleContext
        );
        return order.id;
      }

      const order = await tx.order.create({
        data: {
          tableId: context.tableId,
          status: 'EN_ATTENTE',
          paymentMethod: 'STRIPE',
          totalAmount: plan.totalAmount,
          userId: context.user.id,
          orderItems: {
            create: context.lines.map((line) => ({
              dishId: line.dishId,
              quantity: line.quantity,
              unitPrice: plan.dishById.get(line.dishId)!.price,
            })),
          },
          payments: {
            create: {
              method: 'STRIPE',
              amount: plan.totalAmount,
              status: 'PENDING',
            },
          },
        },
        select: { id: true },
      });
      return order.id;
    }, SALE_TX_OPTIONS);
  } catch (error) {
    return mapSaleError(error, t);
  }

  revalidatePath('/caisse/pos');
  return {
    success: true,
    message:
      method === PaymentMethod.CASH ? t('saleRecorded') : t('paymentStarted'),
    orderId,
  } satisfies SaleState;
}

export async function createCheckoutSession(
  _prev: SaleState,
  formData: FormData
): Promise<SaleState> {
  const t = await getTranslations('Feedback.sales');
  const tValidation = await getTranslations('Validation');
  const saleContext = await getSaleContext();

  const context = await resolveSaleContext(formData, t, tValidation);
  if ('error' in context) return context.error;

  let orderId: string;
  let totalAmount: Prisma.Decimal;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const plan = await buildSalePlan(
        tx,
        context.user.establishmentId,
        context.lines,
        saleContext
      );
      const order = await tx.order.create({
        data: {
          tableId: context.tableId,
          status: 'EN_ATTENTE',
          paymentMethod: 'STRIPE',
          totalAmount: plan.totalAmount,
          userId: context.user.id,
          orderItems: {
            create: context.lines.map((line) => ({
              dishId: line.dishId,
              quantity: line.quantity,
              unitPrice: plan.dishById.get(line.dishId)!.price,
            })),
          },
          payments: {
            create: {
              method: 'STRIPE',
              amount: plan.totalAmount,
              status: 'PENDING',
            },
          },
        },
        select: { id: true, totalAmount: true },
      });
      return order;
    }, SALE_TX_OPTIONS);
    orderId = created.id;
    totalAmount = created.totalAmount;
  } catch (error) {
    return mapSaleError(error, t);
  }

  if (!stripeConfigured()) {
    return {
      errors: { form: [t('cardUnavailable')] },
      message: t('paymentFailed'),
      orderId,
    } satisfies SaleState;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  let sessionUrl: string;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: STRIPE_CURRENCY,
            unit_amount: tndToEuroCents(totalAmount.toNumber()),
            product_data: {
              name: t('stripeOrderName', {
                name: context.user.establishmentName,
              }),
            },
          },
        },
      ],
      metadata: { orderId },
      success_url: `${baseUrl}/api/stripe/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/caisse/pos`,
    });
    sessionUrl = session.url!;
  } catch (error) {
    console.error('createCheckoutSession failed', error);
    return {
      errors: { form: [t('cardFailed')] },
      message: t('paymentFailed'),
      orderId,
    } satisfies SaleState;
  }

  revalidatePath('/caisse/pos');
  redirect(sessionUrl);
}
